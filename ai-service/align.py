import cv2
import numpy as np

def align_images(img1_path, img2_path, out_path):
    print('Loading images...')
    img1 = cv2.imread(img1_path) # Before 
    img2 = cv2.imread(img2_path) # After (to be aligned to Before)
    
    img1_gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    img2_gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    
    # ORB detector
    orb = cv2.ORB_create(5000)
    keypoints1, descriptors1 = orb.detectAndCompute(img1_gray, None)
    keypoints2, descriptors2 = orb.detectAndCompute(img2_gray, None)
    
    # Match features
    matcher = cv2.DescriptorMatcher_create(cv2.DESCRIPTOR_MATCHER_BRUTEFORCE_HAMMING)
    matches = matcher.match(descriptors1, descriptors2, None)
    
    # Sort matches by score
    matches = sorted(matches, key=lambda x: x.distance)
    
    # Keep top 15% 
    keep = int(len(matches) * 0.15)
    matches = matches[:keep]
    
    # Extract locations of good matches
    pts1 = np.zeros((len(matches), 2), dtype=np.float32)
    pts2 = np.zeros((len(matches), 2), dtype=np.float32)
    
    for i, match in enumerate(matches):
        pts1[i, :] = keypoints1[match.queryIdx].pt
        pts2[i, :] = keypoints2[match.trainIdx].pt
        
    # Find homography
    h, mask = cv2.findHomography(pts2, pts1, cv2.RANSAC)
    
    # Use homography to warp image
    height, width, channels = img1.shape
    img2_aligned = cv2.warpPerspective(img2, h, (width, height))
    
    cv2.imwrite(out_path, img2_aligned)
    print('Aligned image saved to', out_path)

align_images(
    '../backend/public/images/monuments/taj-mahal-before.jpg',
    '../backend/public/images/monuments/taj-mahal-after.jpg',
    '../backend/public/images/monuments/taj-mahal-after.jpg'
)
align_images(
    '../backend/public/images/monuments/taj-mahal-before.jpg',
    '../frontend/public/images/monuments/taj-mahal-after.jpg',
    '../frontend/public/images/monuments/taj-mahal-after.jpg'
)
