import random
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os

from tensorflow.keras.models import load_model


# Load the saved model
base_path = "C:/Users/yulif/Documents/GitHub/SoftwareEngineeringCourse-DepressionDiagnosis"
# base_path = "D:/0SoftwareEngineering/SoftwareEngineeringCourse-FrontEnd-With-Database-main/SoftwareEngineeringCourse-FrontEnd-With-Database-main"
# D:\0SoftwareEngineering\SoftwareEngineeringCourse-FrontEnd-With-Database-main\SoftwareEngineeringCourse-FrontEnd-With-Database-main
model = load_model(base_path + "/mymodel2.h5")

folder_path = base_path+"/images"  # 替换为你的文件夹路径

# 获取文件夹中所有文件的路径和修改时间
files = []
for root, _, filenames in os.walk(folder_path):
    for filename in filenames:
        file_path = os.path.join(root, filename)
        file_time = os.path.getmtime(file_path)
        files.append((file_path, file_time))

# 按照修改时间进行排序
files.sort(key=lambda x: x[1], reverse=True)

# 获取最晚修改时间的文件路径
latest_file_path = files[0][0]




def preprocess_image(image_path):
    img = image.load_img(image_path, target_size=(224, 224))
    img = image.img_to_array(img)
    img = tf.keras.applications.vgg16.preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    return img

# Function to make predictions using the trained model
def predict(image_path):
    # Preprocess the image
    img = preprocess_image(image_path)

    # Make prediction using the model
    prediction = model.predict(img)
    return prediction[0][0]

# Example usage
image_path = latest_file_path # Replace with the path to your test image

prediction = predict(image_path)

print(str(prediction))

