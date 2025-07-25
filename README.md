# Adaptive Study Planner
## Overview 
The Adaptive Study Planner is an innovative web application designed to help students and self-learners manage their time effectively by generating personalized and optimized study schedules. Leveraging the power of Genetic Algorithms (GA), this tool overcomes the limitations of traditional, static scheduling methods, which often lead to decision fatigue, missed deadlines, and reduced productivity. Users can input their fixed commitments, task deadlines, and preferred study times, and the system dynamically produces a tailored schedule to maximize efficiency and align with individual needs.
<br>
This project highlights the effectiveness of AI-driven adaptive scheduling solutions, contributing to the advancement of intelligent tools that enhance time management and academic organization.
<br>
## Features 
1. Personalized Schedule Generation: Utilizes a Genetic Algorithm to create unique study plans based on user-defined inputs. <br>
2. Fixed Commitments Input: Allows users to block out recurring classes, work, or appointments by specifying subject, day, and time. <br>
3. Task Management: Users can input tasks with details such as task name, estimated completion time, due date, and priority (tasks due within 5 days are auto-prioritized). <br>
4. Study Preferences: Customize schedules by setting preferred study times (morning, afternoon, evening, night), ideal study session durations, and preference for breaks. <br>
5. Interactive Schedule Output: View generated schedules in both weekly and monthly formats. <br>
6. Post-Generation Editing: Drag-and-drop functionality to easily adjust and fine-tune task placements within the generated schedule. <br>
7. Schedule Export: Download the generated weekly or monthly schedule as a PNG image for offline use or sharing. <br>
8. Client-Side Operation: All data processing and algorithm execution occur directly in the browser, ensuring user privacy as no data is stored on external servers.<br>

## Technologies Used
- HTML5: For structuring the web content.
- CSS3: For styling the application, utilizing a combination of custom CSS and Tailwind CSS for responsive and modern design.
- JavaScript: For all client-side logic, including user input handling, data validation, the Genetic Algorithm implementation, and dynamic UI updates.
- html2canvas: A JavaScript library used for capturing and downloading the schedule as a PNG image.

## How to Run Locally
This application is entirely client-side, meaning you don't need any special server setup or backend dependencies to run it.

### Clone the Repository:

## 1. Open your terminal or command prompt and navigate to the directory where you want to store the project. Then, run the following command:
```bash
git clone https://github.com/your-username/your-repository-name.git
# Replace 'your-username/your-repository-name' with your actual GitHub repo path
```

2. Navigate to the Project Directory:
Change into the newly cloned project directory:

cd your-repository-name

Open the Application:
Locate the homepage.html file within the project directory and open it directly in your preferred web browser (e.g., Chrome, Firefox, Edge).

Alternatively, you can use a live server extension in your code editor (like "Live Server" for VS Code) for a more convenient development experience, though it's not strictly necessary for running the application.

Usage
Once the homepage.html file is open in your browser:

Click the "Get Started" button on the home page.

Step 1: Fixed Commitments: Enter your recurring commitments (classes, work, etc.). Provide the subject, day, start time, and end time. Click "Add Commitment" for each. You can remove commitments using the 'x' button. Click "Next" when done.

Step 2: Your Tasks: Input your assignments and tasks. Include the task name, estimated time to complete (in hours), due date (using the calendar picker), and set a priority using the slider. Click "Add Task" for each. Click "Next" when done.

Step 3: Study Preferences: Select your preferred study times (morning, afternoon, evening, night), ideal study session durations, and whether you prefer breaks.

Click "Generate Timetable" to see your personalized schedule.

On the output page, you can toggle between "Weekly" and "Monthly" views.

To make adjustments, drag and drop task blocks within the weekly view. Changes will reflect in both views.

Click "Download PNG" to save your schedule.

Click "Start Over" to create a new schedule.

Future Enhancements
Enhanced UI/UX: Further improve the visual design and interactivity of the generated schedules for a more polished user experience.

User Accounts & Data Persistence: Implement a user authentication system to allow users to save their schedules, track progress, and retrieve historical data across sessions.

Full Deployment: Deploy the application to a public web server for broader accessibility and real-world usage.

Advanced GA Optimization: Explore techniques for dynamic parameter tuning within the Genetic Algorithm to potentially improve efficiency and solution quality for increasingly complex scheduling scenarios.

Expanded Constraints & Preferences: Integrate more nuanced preferences (e.g., preferred subjects for certain times, daily energy curves) and dynamic constraints (e.g., real-time event updates).

Hybrid Algorithm Exploration: Investigate combining Genetic Algorithms with other expert system approaches to leverage the strengths of multiple methods for even more robust scheduling.

Credits
Author: YEONG MENG LI (21018429)

Supervisor: Hadyan Hafizh

University: Sunway University, Department of Smart Computing and Cyber Resilience, School of Engineering and Technology.
