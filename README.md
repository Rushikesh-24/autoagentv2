# AI Agent Creation & Monetization Platform

## Team Information

*Team Name:* RETROTHON-008

*Team Members:*

- *Kedron Lucas* - 8698256841 | [kedronlucas@gmail.com](mailto\:kedronlucas@gmail.com)
- *Shridhar Kamat* - 9284748854 | [shridharkamat10@gmail.com](mailto\:shridharkamat10@gmail.com)
- *Rushikesh Goankar* - 9699388902 | [rushikeshgoankar24@gmail.com](mailto\:rushikeshgoankar24@gmail.com)

## Individual Contributions

- *Kedron Lucas:* Custom Model Integration, Flask Backend for hosting the regression model that was planned to demonstrate the Costom model AI Agent. Worked on the model architecture creation function, training for the model, and also using the model for predicting outputs. Worked on the marketplace logic, AI Chatbot implementation for making AI Agent creation easier. 
- *Shridhar Kamat:* Worked on the flow connection logic, Handled the canvas frontend, Backend logic for determining the connectivity between nodes. Worked on improving the server side implementation to improve making API calls for the AI Agents created by the user. This is beneficial in the long run for scaling the product. 
- *Rushikesh Goankar:* Frontend, Worked on the flow generation logic. Backend logic for the market place logic, that includes selling the AI Agent.Worked on refining the user dashboard, that helps user keep track of the products being sold. Also improved the market place, by including the trending section. Worked on creating the chatbot for the user, to make the process of creating AI Agent easier for the users, speciallty those that dont have much experience.

## Folder Structure

Project

│── /convex            # Contains all the database configuration of Convex DB  
│── /node_modules      # Contains installed dependencies  
│── /public            # Contains all the static assets  
│── /src  
│   │── /app           # Next.js App Router directory  
│   │── /components    # Contains reusable UI components  
│   │   │── /nodes     # Node-related components  
│   │   │── /ui        # UI-specific components  
│   │── /lib           # Utility functions and middleware  
│── /.next             # Build files for Next.js  
│── /.env.local        # Environment variables  
│── /.gitignore        # Git ignore file  
│── /components.json   # Configuration for components  
│── /eslint.config.mjs # ESLint configuration  
│── /next-env.d.ts     # TypeScript environment declarations  
│── /next.config.js    # Next.js configuration file  
│── /package-lock.json # Dependency lock file  
│── /package.json      # Project dependencies  
│── /postcss.config.mjs# PostCSS configuration  
│── /README.md         # Project documentation  
│── /tsconfig.json     # TypeScript configuration  

## Approach to Solve the Problem

1. **No-Code/Low-Code AI Agent Builder:** Developed an intuitive drag-and-drop interface for defining AI workflows. User can make api calls to there agents from their application.
2. **RAG & Fine-Tuning:** Integrated LLMs like Gemini and Groq to allow users to fine-tune responses.
3. **Custom Model Creation:** Allows user to create models by setting parameters, using custom training data and multi training. Allows users to import their custom models as well.
4. **API & Third-Party Integration:** Enabled seamless connection of AI agents with external apps, databases, and tools.
5. **Monetization & Marketplace:** Built an in-platform monetization system allowing subscriptions and pay-per-use agents. Allows user to sell agents that they create.
6. **Database Management:** Used Convex DB for scalable and efficient data storage.
7. **Frontend Development:** Designed a user-friendly interface with interactive components.
8. **Backend Development:** Implemented logic for AI workflow execution and database interactions.
9. **Deployment & Testing:** Rigorously tested the platform and deployed it for seamless user access.

## Tech Stack

- **Frontend:** Next.js, React.js
- **Backend:** Node.js, Express
- **Database:** Convex DB
- **UI Components** Shadcn, RadixUI
- **Styling** Tailwind
- **Flow Building Library** Reactflow
- **Charts** Recharts
- **Form Handling** React Hook Form
- **Languages** TypeScript, JavaScript, Python
- **Icons** Lucide Icons
- **AI Model Integration:** Gemini, Groq
- **Authentication:** Clerk
- **Hosting & Deployment:** Vercel

## Build and Run Commands

### Backend

```sh
# Install dependencies
npm install  

# Run the backend server
npm start  
```

## Future Enhancements
Enhanced AI Workflow Builder: Adding more advanced customization options.

Intergration from HuggingFace for models.

Integration for Kaggle for dataset usage while using custom models.

Prebuilt AI Templates: Providing ready-made AI agents for various industries.

Blockchain Integration: Enabling decentralized transactions for AI monetization.

Advanced Analytics: Providing insights into AI agent performance and user interactions.

Mobile App Support: Expanding platform capabilities to mobile devices.
   
