import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Globe2,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Sparkles,
  Sun,
  Target,
  Trash2,
  X,
} from "lucide-react";

type Language = "en" | "ur";
type Page = "today" | "week" | "checklist" | "progress" | "settings";
type Priority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  time: string;
  duration: number;
  category: string;
  color: string;
  done: boolean;
  fixed: boolean;
  priority: Priority;
  day: number;
};

type Labels = {
  today: string;
  week: string;
  checklist: string;
  progress: string;
  settings: string;
  greeting: string;
  tasks: string;
  add: string;
  completed: string;
  left: string;
  empty: string;
  save: string;
  cancel: string;
  taskTitle: string;
  time: string;
  duration: string;
  category: string;
  priority: string;
  fixed: string;
  name: string;
  welcome: string;
  start: string;
  language: string;
  upcoming: string;
  minutes: string;
  complete: string;
  delete: string;
  signout: string;
};

const labels: Record<Language, Labels> = {
  en: {
    today: "Today",
    week: "Week",
    checklist: "Checklist",
    progress: "Progress",
    settings: "Settings",
    greeting: "A little progress adds up.",
    tasks: "Your routine",
    add: "Add task",
    completed: "completed",
    left: "to go",
    empty: "No tasks yet. Add one to get started.",
    save: "Save task",
    cancel: "Cancel",
    taskTitle: "What do you need to do?",
    time: "Time",
    duration: "Duration (minutes)",
    category: "Category",
    priority: "Priority",
    fixed: "Fixed commitment",
    name: "Your name",
    welcome: "Welcome to Daywell",
    start: "Open my planner",
    language: "Language",
    upcoming: "Coming up",
    minutes: "min",
    complete: "Completion rate",
    delete: "Delete",
    signout: "Sign out",
  },
  ur: {
    today: "آج",
    week: "ہفتہ",
    checklist: "فہرست",
    progress: "پیش رفت",
    settings: "ترتیبات",
    greeting: "تھوڑی سی پیش رفت بھی اہم ہے۔",
    tasks: "آپ کے کام",
    add: "کام شامل کریں",
    completed: "مکمل",
    left: "باقی",
    empty: "ابھی کوئی کام نہیں۔ شروع کرنے کے لیے ایک شامل کریں۔",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    taskTitle: "آپ کو کیا کرنا ہے؟",
    time: "وقت",
    duration: "دورانیہ (منٹ)",
    category: "قسم",
    priority: "ترجیح",
    fixed: "مقررہ وقت",
    name: "آپ کا نام",
    welcome: "Daywell میں خوش آمدید",
    start: "پلانر کھولیں",
    language: "زبان",
    upcoming: "اگلا کام",
    minutes: "منٹ",
    complete: "تکمیل کی شرح",
    delete: "حذف کریں",
    signout: "سائن آؤٹ",
  },
};

const starterTasks: Task[] = [
  {
    id: "task-1",
    title: "Morning prayer",
    time: "05:30",
    duration: 20,
    category: "Prayer",
    color: "gold",
    done: true,
    fixed: true,
    priority: "High",
    day: 0,
  },
  {
    id: "task-2",
    title: "Plan your day",
    time: "07:15",
    duration: 15,
    category: "Personal",
    color: "blue",
    done: false,
    fixed: false,
    priority: "Medium",
    day: 0,
  },
  {
    id: "task-3",
    title: "Focus session · coursework",
    time: "09:00",
    duration: 90,
    category: "Study",
    color: "violet",
    done: false,
    fixed: true,
    priority: "High",
    day: 0,
  },
  {
    id: "task-4",
    title: "Take a lunch break",
    time: "12:30",
    duration: 45,
    category: "Rest",
    color: "green",
    done: false,
    fixed: false,
    priority: "Low",
    day: 0,
  },
  {
    id: "task-5",
    title: "Read a few pages",
    time: "16:00",
    duration: 30,
    category: "Reading",
    color: "rose",
    done: false,
    fixed: false,
    priority: "Medium",
    day: 0,
  },
];

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readTasks(): Task[] {
  try {
    const savedTasks = localStorage.getItem("dw-tasks");
    return savedTasks ? (JSON.parse(savedTasks) as Task[]) : starterTasks;
  } catch {
    return starterTasks;
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() =>
    localStorage.getItem("dw-lang") === "ur" ? "ur" : "en",
  );
  const [name, setName] = useState(() => localStorage.getItem("dw-name") ?? "");
  const [signedIn, setSignedIn] = useState(
    () => localStorage.getItem("dw-user") === "yes",
  );
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [page, setPage] = useState<Page>("today");
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    time: "09:00",
    duration: "30",
    category: "Personal",
    priority: "Medium" as Priority,
    fixed: false,
  });

  const text = labels[language];

  useEffect(() => {
    localStorage.setItem("dw-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("dw-lang", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  }, [language]);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.day === 0)
        .sort((first, second) => first.time.localeCompare(second.time)),
    [tasks],
  );

  const completedCount = todayTasks.filter((task) => task.done).length;
  const completionRate =
    todayTasks.length === 0
      ? 0
      : Math.round((completedCount / todayTasks.length) * 100);

  const navigation: { id: Page; label: string }[] = [
    { id: "today", label: text.today },
    { id: "week", label: text.week },
    { id: "checklist", label: text.checklist },
    { id: "progress", label: text.progress },
    { id: "settings", label: text.settings },
  ];

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim() || "Friend";
    setName(cleanName);
    setSignedIn(true);
    localStorage.setItem("dw-name", cleanName);
    localStorage.setItem("dw-user", "yes");
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) return;

    const newTask: Task = {
      id: makeId(),
      title,
      time: form.time,
      duration: Number(form.duration) || 30,
      category: form.category,
      color:
        form.category === "Prayer"
          ? "gold"
          : form.category === "Study"
            ? "violet"
            : form.category === "Rest"
              ? "blue"
              : "green",
      done: false,
      fixed: form.fixed,
      priority: form.priority,
      day: 0,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setForm((currentForm) => ({ ...currentForm, title: "" }));
    setShowForm(false);
    notify("Task added");
  }

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function removeTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id),
    );
  }

  function signOut() {
    localStorage.removeItem("dw-user");
    setSignedIn(false);
  }

  if (!signedIn) {
    return (
      <main className="login-wrap">
        <section className="login-card">
          <Brand />
          <div className="welcome-icon">
            <Sparkles size={24} />
          </div>
          <p className="eyebrow">A LITTLE SPACE FOR YOUR DAY</p>
          <h1>{text.welcome}</h1>
          <p className="muted center">
            Make time for what matters, one small step at a time.
          </p>

          <form className="login-form" onSubmit={handleSignIn}>
            <label>
              {text.name}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Ayesha"
              />
            </label>
            <button className="primary full" type="submit">
              {text.start}
              <ChevronRight size={17} />
            </button>
          </form>

          <div className="trial-box">
            <Sparkles size={17} />
            <div>
              <b>7-day free trial · No card required</b>
              <small>Then $1 for your first month, $5/month after</small>
            </div>
          </div>

          <label className="language-row">
            <span>{text.language}</span>
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as Language)
              }
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
            </select>
          </label>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="side-top">
          <Brand />
          <button
            className="icon-btn mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="profile">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <div>
            <b>{name}</b>
            <small>Personal planner</small>
          </div>
        </div>

        <p className="nav-label">YOUR SPACE</p>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => {
                setPage(item.id);
                setMenuOpen(false);
              }}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="side-spacer" />
        <div className="side-bottom">
          <span>Your day, your pace</span>
          <button
            className="icon-btn"
            onClick={signOut}
            title={text.signout}
            aria-label={text.signout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div className="crumb">
            Daywell <ChevronRight size={14} />
            <b>{navigation.find((item) => item.id === page)?.label}</b>
          </div>

          <div className="top-actions">
            <button
              className="language-chip"
              onClick={() =>
                setLanguage(language === "en" ? "ur" : "en")
              }
            >
              <Globe2 size={16} />
              {language === "en" ? "EN" : "اردو"}
            </button>
            <button
              className="icon-btn notification"
              onClick={() => notify("You are all caught up")}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        <section className="content">
          <div className="hello-row">
            <div>
              <p className="eyebrow">
                {new Intl.DateTimeFormat(
                  language === "ur" ? "ur-PK" : "en-US",
                  { weekday: "long", month: "long", day: "numeric" },
                ).format(new Date())}
              </p>
              <h1>
                {page === "today"
                  ? `Good day, ${name} ☀️`
                  : navigation.find((item) => item.id === page)?.label}
              </h1>
              <p className="muted">
                {page === "today"
                  ? text.greeting
                  : "Your routine at a glance."}
              </p>
            </div>

            <button
              className="primary add-top"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              {text.add}
            </button>
          </div>

          {page === "today" && (
            <>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-icon green-icon">
                    <Check size={17} />
                  </div>
                  <div>
                    <small>{text.complete}</small>
                    <b>{completionRate}%</b>
                    <span>
                      {completedCount} {text.completed} ·{" "}
                      {todayTasks.length - completedCount} {text.left}
                    </span>
                  </div>
                  <div
                    className="ring"
                    style={
                      { "--percent": `${completionRate * 3.6}deg` } as CSSProperties
                    }
                  >
                    <b>{completionRate}%</b>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon violet-icon">
                    <Clock3 size={17} />
                  </div>
                  <div>
                    <small>Focus time</small>
                    <b>2h 35m</b>
                    <span>Across your planned tasks</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-icon gold-icon">✦</div>
                  <div>
                    <small>Consistency</small>
                    <b>4 days</b>
                    <span>You’re building a rhythm</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <section className="panel routine-panel">
                  <div className="panel-head">
                    <div>
                      <h2>{text.tasks}</h2>
                      <p>{todayTasks.length} tasks planned</p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus size={16} />
                      {text.add}
                    </button>
                  </div>

                  <div className="view-tabs">
                    {(["today", "week", "checklist"] as Page[]).map((item) => (
                      <button
                        key={item}
                        className={page === item ? "selected" : ""}
                        onClick={() => setPage(item)}
                      >
                        {navigation.find((navItem) => navItem.id === item)?.label}
                      </button>
                    ))}
                  </div>

                  <div className="task-list">
                    {todayTasks.length === 0 ? (
                      <div className="empty">{text.empty}</div>
                    ) : (
                      todayTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          text={text}
                          onToggle={toggleTask}
                          onDelete={removeTask}
                        />
                      ))
                    )}
                  </div>
                </section>

                <aside className="right-column">
                  <section className="panel ai-panel">
                    <div className="ai-top">
                      <div className="ai-icon">
                        <Sparkles size={18} />
                      </div>
                      <span className="beta">ROUTINE PLANNER</span>
                    </div>
                    <h3>Make room for what matters.</h3>
                    <p>Add a task to start building your routine.</p>
                    <button
                      className="primary full"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus size={16} />
                      {text.add}
                    </button>
                  </section>

                  <section className="panel next-panel">
                    <div className="panel-head compact">
                      <div>
                        <h3>{text.upcoming}</h3>
                        <p>Your next task</p>
                      </div>
                      <Clock3 size={17} />
                    </div>

                    {todayTasks.find((task) => !task.done) ? (
                      <div className="next-task">
                        <div className="category-mark green" />
                        <div>
                          <b>
                            {todayTasks.find((task) => !task.done)?.title}
                          </b>
                          <small>
                            {todayTasks.find((task) => !task.done)?.duration}{" "}
                            {text.minutes}
                          </small>
                        </div>
                        <time>
                          {todayTasks.find((task) => !task.done)?.time}
                        </time>
                      </div>
                    ) : (
                      <p className="muted">All done for today. Take a breath.</p>
                    )}
                  </section>
                </aside>
              </div>
            </>
          )}

          {page === "week" && (
            <section className="panel full-panel">
              <div className="panel-head">
                <div>
                  <h2>{text.week}</h2>
                  <p>Your tasks for the week</p>
                </div>
                <CalendarDays size={20} />
              </div>
              <div className="week-grid">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => (
                    <div className="week-day" key={day}>
                      <small>{day}</small>
                      <b>{index + 1}</b>
                      <span>
                        {tasks.filter((task) => task.day === index).length} tasks
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          {page === "checklist" && (
            <section className="panel full-panel">
              <div className="panel-head">
                <div>
                  <h2>{text.checklist}</h2>
                  <p>
                    {completedCount} {text.completed} ·{" "}
                    {todayTasks.length - completedCount} {text.left}
                  </p>
                </div>
              </div>
              <div className="task-list">
                {todayTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    text={text}
                    onToggle={toggleTask}
                    onDelete={removeTask}
                  />
                ))}
              </div>
            </section>
          )}

          {page === "progress" && (
            <section className="panel full-panel">
              <h2>{text.progress}</h2>
              <div className="progress-stats">
                <div>
                  <small>Tasks completed</small>
                  <b>{completedCount}</b>
                </div>
                <div>
                  <small>{text.complete}</small>
                  <b>{completionRate}%</b>
                </div>
                <div>
                  <small>Tasks planned</small>
                  <b>{todayTasks.length}</b>
                </div>
              </div>
            </section>
          )}

          {page === "settings" && (
            <section className="panel full-panel settings-panel">
              <h2>{text.settings}</h2>
              <label className="setting-row">
                <span>{text.language}</span>
                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as Language)
                  }
                >
                  <option value="en">English</option>
                  <option value="ur">اردو</option>
                </select>
              </label>
              <label className="setting-row">
                <span>Reminders</span>
                <input type="checkbox" defaultChecked />
              </label>
            </section>
          )}

          <footer className="footer">
            <span>© 2026 Daywell</span>
            <span>Made for real life, at your pace.</span>
          </footer>
        </section>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <form className="modal" onSubmit={handleAddTask}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">ADD TO YOUR DAY</p>
                <h2>{text.add}</h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <label>
              {text.taskTitle}
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Read for 20 minutes"
              />
            </label>

            <div className="form-row">
              <label>
                {text.time}
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    setForm({ ...form, time: event.target.value })
                  }
                />
              </label>
              <label>
                {text.duration}
                <input
                  type="number"
                  min="5"
                  max="720"
                  value={form.duration}
                  onChange={(event) =>
                    setForm({ ...form, duration: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                {text.category}
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  <option>Personal</option>
                  <option>Study</option>
                  <option>Work</option>
                  <option>Prayer</option>
                  <option>Reading</option>
                  <option>Wellbeing</option>
                  <option>Rest</option>
                </select>
              </label>

              <label>
                {text.priority}
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      priority: event.target.value as Priority,
                    })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
            </div>

            <label className="check-label">
              <input
                type="checkbox"
                checked={form.fixed}
                onChange={(event) =>
                  setForm({ ...form, fixed: event.target.checked })
                }
              />
              {text.fixed}
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="outline"
                onClick={() => setShowForm(false)}
              >
                {text.cancel}
              </button>
              <button className="primary" type="submit">
                {text.save}
                <ChevronRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {notice && (
        <div className="toast">
          <Check size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Sun size={19} />
      </div>
      <span>daywell</span>
      <small>YOUR DAY, IN BALANCE</small>
    </div>
  );
}

function TaskRow({
  task,
  text,
  onToggle,
  onDelete,
}: {
  task: Task;
  text: Labels;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className={`task-row ${task.done ? "is-done" : ""}`}>
      <button
        className={`task-check ${task.done ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
        aria-label="Mark task complete"
      >
        {task.done && <Check size={14} />}
      </button>

      <div className={`category-mark ${task.color}`} />

      <div className="task-main">
        <b>{task.title}</b>
        <small>
          {task.category}
          {task.fixed ? " · Fixed" : ""} · {task.duration} {text.minutes}
        </small>
      </div>

      <time>{task.time}</time>

      <span className={`priority priority-${task.priority.toLowerCase()}`}>
        {task.priority}
      </span>

      <button
        className="delete-btn"
        onClick={() => onDelete(task.id)}
        title={text.delete}
        aria-label={text.delete}
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}