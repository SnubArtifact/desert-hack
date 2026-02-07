const TEMPLATES = [
    {
        id: "leave_request",
        title: "Request for Leave",
        description: "Asking for time off due to personal reasons.",
        text: "Yaar, mujhe agle hafte 2 din ki chutti chahiye ghar ke kaam ke liye. Kaam manage ho jayega."
    },
    {
        id: "project_delay",
        title: "Project Delay",
        description: "Informing the team about a slight delay in deliverable.",
        text: "Bhai, project thoda late ho jayega kyunki client ne end moment pe changes mang liye hain. Kal tak pakka bhej dunga."
    },
    {
        id: "follow_up",
        title: "Payment Follow-up",
        description: "Gentle reminder for an outstanding invoice.",
        text: "Hello, woh purana payment abhi tak nahi aaya hai. Please ek baar check karke batado kab tak hoga."
    },
    {
        id: "feedback",
        title: "Constructive Feedback",
        description: "Giving feedback to a colleague on their work.",
        text: "Bhai, kaam toh theek hai but thodi aur mehnat chahiye presentation pe. Bahut casual lag raha hai."
    },
    {
        id: "meeting_reschedule",
        title: "Meeting Reschedule",
        description: "Asking to move a meeting to a better time.",
        text: "Abhi main busy hoon, kya meeting dopahar ko 3 baje kar sakte hain? Tab tension kam hogi."
    }
];

export const getTemplates = () => TEMPLATES;

const TemplateService = {
    getTemplates
};

export default TemplateService;
