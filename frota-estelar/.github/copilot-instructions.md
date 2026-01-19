# Copilot Instructions for Frota Estelar

## Overview
This project is a React-based application that simulates a space academy experience. It involves managing cadets, missions, and NPC interactions, utilizing a rich set of components and state management through React Query.

## Architecture
- **Components**: The application is structured around reusable components located in the `src/components` directory. Key components include:
  - `CadetProfile`: Displays cadet information and skills.
  - `MissionCard`: Represents individual missions.
  - `EnhancedNPCInteraction`: Manages interactions with NPCs.
- **Pages**: The main application logic resides in `src/Pages/home.js`, which orchestrates the various components and manages state.
- **API Integration**: The application communicates with a backend service through the `base44` client, handling authentication and data fetching for cadets, missions, and NPCs.

## Developer Workflows
- **Running the Application**: Use `npm start` to run the application in development mode.
- **Building for Production**: Use `npm run build` to create an optimized build for production.
- **Testing**: Ensure to write tests for components using Jest and React Testing Library. Run tests with `npm test`.

## Project Conventions
- **State Management**: The application uses React Query for data fetching and state management, which simplifies server state management and caching.
- **Styling**: CSS is managed through Tailwind CSS, allowing for utility-first styling.
- **Routing**: React Router is used for navigation between different pages and components.

## Integration Points
- **External Dependencies**: The project relies on several key libraries:
  - `@tanstack/react-query`: For data fetching and caching.
  - `framer-motion`: For animations and transitions.
  - `lucide-react`: For icons.
- **Cross-Component Communication**: Components communicate through props and context, ensuring a clear data flow and state management.

## Examples
- **Fetching Data**: Use the `useQuery` hook from React Query to fetch data, as seen in the `home.js` file for fetching cadets and missions.
- **Mutations**: Use the `useMutation` hook for creating, updating, and deleting entities, ensuring to invalidate queries on success to keep the UI in sync.

## Conclusion
This document serves as a guide for AI coding agents to understand the structure and workflows of the Frota Estelar project. For further details, refer to the specific component files and the main application logic in `home.js`.