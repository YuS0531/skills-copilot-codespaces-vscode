const initialHabits = [
  { id: 1, name: "阅读", icon: "📖", records: {} },
  { id: 2, name: "运动", icon: "🏃", records: {} },
  { id: 3, name: "背单词", icon: "🔤", records: {} },
];

let habits = initialHabits;
let calendarDate = new Date();

const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  habitList: document.querySelector("#habitList"),
  emptyState: document.querySelector("#emptyState"),
  progressRing: document.querySelector("#progressRing"),
  progressValue: document.querySelector("#progressValue"),
  progressText: document.querySelector("#progressText"),
  calendarTitle: document.querySelector("#calendarTitle"),
  calendarDays: document.querySelector("#calendarDays"),
  addDialog: document.querySelector("#addDialog"),
  habitForm: document.querySelector("#habitForm"),
  habitName: document.querySelector("#habitName"),
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

const monthFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
});

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(first, second) {
  return dateKey(first) === dateKey(second);
}

function getStreak(habit) {
  let streak = 0;
  const day = new Date();

  while (habit.records[dateKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }

  return streak;
}

function getHabitIcon(name) {
  const iconMap = [
    ["读", "📖"],
    ["书", "📖"],
    ["运动", "🏃"],
    ["跑", "🏃"],
    ["单词", "🔤"],
    ["学习", "📚"],
    ["水", "💧"],
    ["早起", "🌅"],
    ["日记", "✍️"],
  ];

  return iconMap.find(([keyword]) => name.includes(keyword))?.[1] || "✦";
}

function renderHabits() {
  const today = dateKey(new Date());
  const completedCount = habits.filter((habit) => habit.records[today]).length;
  const progress = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;

  elements.habitList.innerHTML = habits
    .map((habit) => {
      const completed = Boolean(habit.records[today]);
      const streak = getStreak(habit);

      return `
        <div class="habit-row ${completed ? "completed" : ""}">
          <div class="habit-main">
            <span class="habit-icon">${habit.icon}</span>
            <div class="habit-info">
              <p class="habit-name">${escapeHtml(habit.name)}</p>
              <span class="habit-streak">连续 <strong>${streak}</strong> 天</span>
            </div>
          </div>
          <button
            class="check-button ${completed ? "completed" : ""}"
            type="button"
            data-habit-id="${habit.id}"
            aria-label="${completed ? "取消" : "完成"}${escapeHtml(habit.name)}"
          >${completed ? "✓" : ""}</button>
        </div>
      `;
    })
    .join("");

  elements.emptyState.classList.toggle("hidden", habits.length > 0);
  elements.progressValue.textContent = `${progress}%`;
  elements.progressText.textContent = `${completedCount} / ${habits.length} 已完成`;
  elements.progressRing.style.background = `conic-gradient(var(--purple) ${progress * 3.6}deg, var(--purple-soft) 0deg)`;
}

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  elements.calendarTitle.textContent = monthFormatter.format(calendarDate);
  const cells = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    cells.push(`<span class="day muted">${daysInPreviousMonth - index}</span>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentDay = new Date(year, month, day);
    const key = dateKey(currentDay);
    const completed = habits.some((habit) => habit.records[key]);
    const today = isSameDay(currentDay, new Date());
    cells.push(`
      <span class="day ${completed ? "completed" : ""} ${today ? "today" : ""}">
        ${day}
      </span>
    `);
  }

  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day += 1) {
    cells.push(`<span class="day muted">${day}</span>`);
  }

  elements.calendarDays.innerHTML = cells.join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

document.querySelector("#openAddButton").addEventListener("click", () => {
  elements.habitForm.reset();
  elements.addDialog.showModal();
  elements.habitName.focus();
});

document.querySelector("#closeDialog").addEventListener("click", () => {
  elements.addDialog.close();
});

elements.addDialog.addEventListener("click", (event) => {
  if (event.target === elements.addDialog) {
    elements.addDialog.close();
  }
});

elements.habitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.habitName.value.trim();

  if (!name) {
    return;
  }

  habits.push({
    id: Date.now(),
    name,
    icon: getHabitIcon(name),
    records: {},
  });
  elements.addDialog.close();
  renderHabits();
  renderCalendar();
});

elements.habitList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-habit-id]");
  if (!button) {
    return;
  }

  const habit = habits.find((item) => item.id === Number(button.dataset.habitId));
  if (!habit) {
    return;
  }

  const today = dateKey(new Date());
  habit.records[today] = !habit.records[today];
  renderHabits();
  renderCalendar();
});

document.querySelector("#previousMonth").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

elements.todayLabel.textContent = dateFormatter.format(new Date());
renderHabits();
renderCalendar();
