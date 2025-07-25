# Adaptive Study Planner
## Overview 
The Adaptive Study Planner is a web application designed to help university students manage their time effectively by generating personalized and optimized study schedules. Leveraging the power of Genetic Algorithms (GA), this tool overcomes the limitations of traditional, static scheduling methods, which often lead to decision fatigue, missed deadlines, and reduced productivity. Users can input their fixed commitments, task deadlines, and preferred study times, and the system dynamically produces a tailored schedule to maximize efficiency and align with individual needs.
<br>
This project highlights the effectiveness of adaptive scheduling solutions, contributing to the advancement of intelligent tools that enhance time management and academic organization.
<br>
## Features 
1. Personalized Schedule Generation: Utilizes a Genetic Algorithm to create unique study plans based on user-defined inputs. <br>
2. Fixed Commitments Input: Allows users to block out recurring classes, work, or appointments by specifying subject, day, and start and end times. <br>
3. Task Management: Users can input tasks with details such as task name, estimated completion time, due date, and task priority (tasks due within 5 days are auto-prioritized). <br>
4. Study Preferences: Customize schedules by setting preferred study times (morning, afternoon, evening, night), ideal study session durations, and preference for breaks. <br>
5. Interactive Schedule Output: View generated schedules in both weekly and monthly formats. <br>
6. Post-Generation Editing: Drag-and-drop functionality to easily adjust and fine-tune task placements within the generated schedule. <br>
7. Schedule Export: Download the generated weekly or monthly schedule as a PNG image for offline use or sharing. <br>

## Technologies Used
- HTML: For structuring the web content.
- CSS: For styling the application, utilizing a combination of custom CSS and Tailwind CSS for responsive and modern design.
- JavaScript: For all client-side logic, including user input handling, data validation, the Genetic Algorithm implementation, and dynamic UI updates.
- html2canvas: A JavaScript library used for capturing and downloading the schedule as a PNG image.

## How to Run Locally
This application is entirely client-side, meaning you don't need any special server setup or backend dependencies to run it.

## Clone the Repository:

### 1. Open your terminal or command prompt and navigate to the directory where you want to store the project. Then, run the following command:
```bash
git clone https://github.com/emilyyeong/GA-scheduler.git
```

### 2. Navigate to the Project Directory:
Change into the newly cloned project directory:
```bash
cd GA-scheduler
```

### 3. Open the Application:
Then, you can execute it directly using the below command in the command line:
```bash
homepage.html
```

