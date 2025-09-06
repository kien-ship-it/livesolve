#!/usr/bin/env python3
"""
Standalone AI Testing Script
============================

This script allows you to test the AI functionality without needing:
- Cloud SQL database
- FastAPI server
- Authentication

Usage:
    python test_ai_standalone.py <image_path>

Requirements:
    - Google Cloud credentials configured
    - GCS bucket accessible
    - All Python dependencies installed
"""

import sys
import os
import json
from pathlib import Path

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_ai_functionality(image_path: str):
    """Test AI functionality with a local image file"""
    
    print(f"🧪 Testing AI functionality with image: {image_path}")
    print("=" * 60)
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        return False
    
    try:
        # Import required modules
        from app.services import gcs_service, feedback_service
        from app.core.config import settings
        import tempfile
        from fastapi import UploadFile
        
        print("✅ Successfully imported AI services")
        
        # Create a temporary file-like object for testing
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Create a temporary file for upload
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        try:
            # Test 1: Upload to GCS
            print("\n📤 Testing GCS upload...")
            with open(temp_file_path, 'rb') as f:
                # Create a mock UploadFile
                upload_file = UploadFile(
                    filename=os.path.basename(image_path),
                    file=f
                )
                
                public_gcs_url = gcs_service.upload_image_to_gcs(
                    file=upload_file, 
                    user_id="test_user_123"
                )
            
            if not public_gcs_url:
                print("❌ Failed to upload image to GCS")
                return False
            
            print(f"✅ Image uploaded successfully: {public_gcs_url}")
            
            # Test 2: Convert to GCS URI
            gcs_bucket_name = settings.GCS_BUCKET_NAME
            gcs_uri = public_gcs_url.replace(
                f"https://storage.googleapis.com/{gcs_bucket_name}/",
                f"gs://{gcs_bucket_name}/",
            )
            print(f"✅ GCS URI: {gcs_uri}")
            
            # Test 3: Test bounding box detection
            print("\n🔍 Testing bounding box detection...")
            bounding_boxes = feedback_service.get_bounding_from_image(gcs_uri=gcs_uri)
            print(f"✅ Detected {len(bounding_boxes)} bounding boxes")
            
            if bounding_boxes:
                print("📋 Bounding boxes:")
                for i, box in enumerate(bounding_boxes):
                    print(f"  {i+1}. {box.label} at {box.box_2d}")
            
            # Test 4: Test error detection
            print("\n🚨 Testing error detection...")
            ai_feedback = feedback_service.get_errorbouding_from_image(gcs_uri=gcs_uri)
            print("✅ AI feedback generated successfully")
            
            print("\n📊 AI Feedback Results:")
            print(json.dumps(ai_feedback, indent=2))
            
            return True
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running this from the backend directory and all dependencies are installed")
        return False
    except Exception as e:
        print(f"❌ Error during AI testing: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python test_ai_standalone.py <image_path>")
        print("\nExample:")
        print("  python test_ai_standalone.py test_image.png")
        print("  python test_ai_standalone.py /path/to/math_work.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    print("🤖 LiveSolve AI Standalone Test")
    print("===============================")
    print("This script tests AI functionality without database requirements")
    print()
    
    success = test_ai_functionality(image_path)
    
    if success:
        print("\n🎉 All AI tests passed successfully!")
        print("Your AI functionality is working correctly.")
    else:
        print("\n💥 AI tests failed. Check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
