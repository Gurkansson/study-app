const studyTips = [
    "🧠 Använd Pomodoro-tekniken: 25 min fokus, 5 min paus.",
    "📚 Repetera regelbundet istället för att hetsplugga.",
    "✍️ Skriv anteckningar för hand – det hjälper minnet.",
    "📵 Minimera distraktioner – stäng av mobilen en stund.",
    "🛌 Sov ordentligt! Sömn förbättrar inlärning.",
];

const StudyTips = () => {
    const tip = studyTips[Math.floor(Math.random() * studyTips.length)];

    return (
        <div className="study-tip-card">
            <h3>📘 Studietips</h3>
            <p>{tip}</p>
        </div>
    );
};

export default StudyTips;
