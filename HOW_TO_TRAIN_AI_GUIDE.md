# The Ultimate Step-by-Step AI Training & Fine-Tuning Guide

Welcome! This guide is written so clearly that anyone—even if you have zero AI or coding knowledge—can easily learn how to prepare images, label them, train our AI models, and make them smarter.

---

## 📖 Table of Contents
1. [What Does Training an AI Model Mean?](#1-what-does-training-an-ai-model-mean)
2. [Step 1: How to Collect Prescription Photos](#step-1-how-to-collect-prescription-photos)
3. [Step 2: How to Label Images (Drawing Boxes for the AI)](#step-2-how-to-label-images-drawing-boxes-for-the-ai)
4. [Step 3: How to Download & Package Your Dataset Zip](#step-3-how-to-download--package-your-dataset-zip)
5. [Step 4: How to Upload Your Dataset to the Platform](#step-4-how-to-upload-your-dataset-to-the-platform)
6. [Step 5: How to Start Training Your AI Model](#step-5-how-to-start-training-your-ai-model)
7. [Step 6: How to Check if Your AI Got Smarter](#step-6-how-to-check-if-your-ai-got-smarter)
8. [Step 7: How to Safely Activate Your New AI Build (CRITICAL WARNING)](#step-7-how-to-safely-activate-your-new-ai-build-critical-warning)

---

## 1. What Does Training an AI Model Mean?

Imagine the AI is like a student learning to read prescriptions. 

When we first start, the AI might recognize standard doctor stamps. But if we want it to recognize **Sri Lankan hospital letterheads, private clinic seals, and local pharmacy stamps**, we have to show it real examples and say: 
> *"Look! This round blue mark is a Doctor Seal, and this header text at the top is a Hospital Letterhead."*

This process is called **Fine-Tuning**. We give the AI examples (pictures + drawn boxes), click **Start Training**, and the computer learns to recognize those exact objects on future prescriptions automatically!

---

## Step 1: How to Collect Prescription Photos

To train the AI well, we need good, real-life pictures of prescriptions.

### What kind of pictures should you gather?
- Hospital letterheads (from government & private hospitals)
- Doctor clinic pads (private practice prescriptions)
- Official rubber seals (circular, oval, or rectangular stamps)
- Pharmacy dispensary stamps
- Printed prescriptions & handwritten doctor notes

### Simple Picture Rules:
1. **Clear File Formats**: JPG, PNG, or WEBP images.
2. **Normal Lighting**: Photos taken under room lights or natural daylight using standard smartphone cameras.
3. **Quantity**: Aim for **100 to 500 pictures** per dataset. The more examples you show the AI, the smarter it gets!

---

## Step 2: How to Label Images (Drawing Boxes for the AI)

To teach the AI what to look for, we draw rectangular boxes around visual items on each prescription photo using a free website called **Roboflow**.

### Simple Instructions to Label Images:

1. Open your browser and go to **[roboflow.com](https://roboflow.com)** (Create a free account).
2. Click **Create New Project**. Set Project Type to **Object Detection** and name it `Sri Lankan Seals`.
3. Upload your prescription photos.
4. Click on an image to start labeling!
5. Use your mouse to click and drag a rectangular box around each item:

### Use these EXACT 4 Label Names when drawing boxes:

| Exact Label Name | What to Draw the Box Around |
| :--- | :--- |
| **`seal`** | Draw a box tightly around any circular, oval, or rectangular doctor rubber seal or stamp. |
| **`letterhead`** | Draw a box around the hospital logo, clinic header name, address, and phone text at the top. |
| **`stamp`** | Draw a box around any pharmacy or dispensary verification stamp. |
| **`layout`** | Draw a box around the main body (the Rx symbol and the written medicine list). |

> **Pro Tip**: Draw the box neatly and tightly around the object. Don't leave huge empty gaps around the seal!

---

## Step 3: How to Download & Package Your Dataset Zip

Once you have labeled all your photos in Roboflow:

1. Click **Generate New Version** in Roboflow.
2. Click **Export Dataset**.
3. Choose format: **YOLOv11 PyTorch Format**.
4. Select **download zip to your computer**.
5. You will get a single `.zip` file (for example: `sri_lankan_seals_v1.zip`).

---

## Step 4: How to Upload Your Dataset to the Platform

Now that you have your `.zip` dataset file ready, let's load it into our platform:

1. Open your browser and go to our platform dashboard: **`http://localhost:3000`**.
2. Look at the left sidebar menu and click **Datasets** (or **Dataset Registry**).
3. You will see a form called **Upload Dataset Archive**:
   - In the **Dataset Name** box, type a clear identifier name without spaces (e.g. `sri_lankan_seals_v1`).
4. Click the amber **Select & Upload Dataset Zip** button.
5. Choose your `sri_lankan_seals_v1.zip` file from your computer.
6. The system will upload and extract your dataset automatically! It will appear in your dataset list.

---

## Step 5: How to Start Training Your AI Model

Now we tell the computer to learn from your dataset!

1. On the left sidebar menu of our platform (`http://localhost:3000`), click **Training** (or **Training Jobs**).
2. Look at the **Manual Training Setup** panel:
   - **Target Detector Model**: Select `Seal Detector` (or whichever detector you are training).
   - **Training Dataset**: Select your newly uploaded dataset (`sri_lankan_seals_v1`).
   - **Epochs**: Leave set to `50` (this tells the computer to review the dataset 50 times).
   - **Batch Size**: Leave set to `16`.
   - **Image Size**: Leave set to `640`.
3. Click the solid amber button: **Start Manual Training**.

### What happens after you click the button?
- The computer starts training in the background!
- You will see a live **progress bar** moving from 0% to 100%.
- You will see live lines of text (logs) showing the computer getting smarter line by line.
- Once it reaches 100%, the status badge changes to **COMPLETED**.
- The system automatically creates a brand new candidate model build (for example: `v4`) and saves it safely in our system!

---

## Step 6: How to Check if Your AI Got Smarter

Once training reaches **COMPLETED**, let's see how accurate your new model build is:

1. On the left sidebar menu, click **Evaluation** (or **Model Evaluation**).
2. Look at the table comparing your model builds (e.g. `v3` vs `v4`).
3. Look at the column called **mAP@50** (this is the AI accuracy score out of 100%):
   - If your old model (`v3`) had an accuracy of **91%**, and your new model (`v4`) has an accuracy of **96%**, congratulations! Your new build is much smarter!

---

## Step 7: How to Safely Activate Your New AI Build (CRITICAL WARNING)

> [!CAUTION]
> **CRITICAL WARNING — PLEASE READ CAREFULLY**:
> Training a new model build (e.g. `v4`) does **NOT** automatically replace the live model used by doctors and mobile apps. It stays safely stored as a **CANDIDATE** build so you don't break anything by accident!

### How to Make Your New Build Live (Only when approved):

1. On the left sidebar menu, click **Models** (or **Model Registry**).
2. Find the model box (e.g. `Seal Detector`).
3. You will see a list of versions:
   - `v1` (Active)
   - `v2`
   - `v4` (Candidate — your newly trained build!)
4. Compare the accuracy number next to `v4`.
5. If `v4` is higher and ready for production, click the **Activate** button next to `v4`.

### What happens when you click Activate?
The platform instantly switches our live production API to use `v4` for all incoming mobile app prescription scans with **zero server downtime**!
