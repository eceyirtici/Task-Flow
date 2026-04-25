"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Priority = "Low" | "Medium" | "High";

type Card = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  label: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
  order: number;
};

type Column = {
  id: string;
  title: string;
  order: number;
};

type Activity = {
  id: string;
  text: string;
  time: string;
};

type Board = {
  id: string;
  title: string;
  columns: Column[];
  cards: Card[];
  activities: Activity[];
};

const defaultBoard: Board = {
  id: "board-1",
  title: "TaskFlow — Kanban Workflow",
  columns: [
    { id: "todo", title: "To Do", order: 1000 },
    { id: "progress", title: "In Progress", order: 2000 },
    { id: "review", title: "Review", order: 3000 },
    { id: "done", title: "Done", order: 4000 },
  ],
  cards: [
  {
    id: "card-1",
    title: "🎯 Prepare project scope",
    description:
      "Define the essential Kanban features and prioritize a reliable 48-hour MVP.",
    columnId: "todo",
    label: "Product",
    assignee: "Ece",
    dueDate: "2026-04-28",
    priority: "High",
    order: 1000,
  },
  {
    id: "card-2",
    title: "🚀 Build sortable drag-and-drop",
    description:
      "Allow cards to move between columns and be reordered within the same column.",
    columnId: "todo",
    label: "Engineering",
    assignee: "Ece",
    dueDate: "2026-04-28",
    priority: "High",
    order: 2000,
  },
  {
    id: "card-3",
    title: "📦 Persist board state",
    description:
      "Store cards, columns, order values, and activity history so refresh does not reset the board.",
    columnId: "progress",
    label: "Data",
    assignee: "Ece",
    dueDate: "2026-04-28",
    priority: "Medium",
    order: 1000,
  },
  {
    id: "card-4",
    title: "📱Improve mobile usability",
    description:
      "Add a Move / Change Status action for touch devices where drag-and-drop may be difficult.",
    columnId: "review",
    label: "Design",
    assignee: "Ece",
    dueDate: "2026-04-28",
    priority: "Low",
    order: 1000,
  },
],
  activities: [],
};

function getPriorityStyle(priority: Priority) {
  if (priority === "High") return "bg-red-100 text-red-700";
  if (priority === "Medium") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
}

function reorderWithStep<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    order: (index + 1) * 1000,
  }));
}

function SortableCard({
  card,
  onEdit,
  onMoveCard,
}: {
  card: Card;
  onEdit: (card: Card) => void;
  onMoveCard: (cardId: string, direction: "up" | "down") => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
className={`rounded-xl border p-4 shadow-sm transition ${
  isDragging
    ? "scale-105 border-blue-400 bg-blue-50 opacity-80 shadow-2xl"
    : "bg-white hover:shadow-lg hover:-translate-y-1 hover:border-pink-300"
}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing"
        >
          <h3 className="font-semibold text-slate-900">{card.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{card.description}</p>
        </div>

        <button
          onClick={() => onEdit(card)}
          className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
        >
          Edit
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-2 py-1 ${getPriorityStyle(card.priority)}`}>
          {card.priority}
        </span>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
          {card.label || "General"}
        </span>
        <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-700">
          {card.assignee || "Unassigned"}
        </span>
        {card.dueDate && (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            {card.dueDate}
          </span>
        )}
      </div>

      <button
        onClick={() => onEdit(card)}
        className="md:hidden mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
      >
        Move / Change Status
      </button>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onMoveCard(card.id, "up")}
          className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
        >
          ↑ Move up
        </button>
        <button
          onClick={() => onMoveCard(card.id, "down")}
          className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
        >
          ↓ Move down
        </button>
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  cards,
  onAddCard,
  onEditCard,
  onMoveCard,
  onMoveColumn,
  onEditColumn,
}: {
  column: Column;
  cards: Card[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onMoveCard: (cardId: string, direction: "up" | "down") => void;
  onMoveColumn: (columnId: string, direction: "left" | "right") => void;
  onEditColumn: (columnId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[520px] w-80 shrink-0 rounded-2xl border p-4 transition ${
        isOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
  <span className="w-1.5 h-5 bg-pink-400 rounded"></span>
  {column.title}
</h2>
          <button
  onClick={() => onEditColumn(column.id)}
  className="text-xs text-blue-600 hover:underline"
>
  Edit column
</button>
          <p className="text-xs text-slate-500">{cards.length} cards</p>
        </div>

        <button
          onClick={() => onAddCard(column.id)}
          className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-700"
        >
          +
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => onMoveColumn(column.id, "left")}
          className="rounded-lg bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
        >
          ← Column
        </button>
        <button
          onClick={() => onMoveColumn(column.id, "right")}
          className="rounded-lg bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
        >
          Column →
        </button>
      </div>

      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onMoveCard={onMoveCard}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

export default function Home() {
  const [user, setUser] = useState("");
  const [authName, setAuthName] = useState("");
  const [board, setBoard] = useState<Board>(defaultBoard);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflow-user");
    const savedBoard = localStorage.getItem("taskflow-board");

    if (savedUser) setUser(savedUser);

    if (savedBoard) {
      const parsed = JSON.parse(savedBoard);

      setBoard({
        ...defaultBoard,
        ...parsed,
        columns: (parsed.columns || defaultBoard.columns).map(
          (column: Column, index: number) => ({
            ...column,
            order: column.order || (index + 1) * 1000,
          })
        ),
        cards: (parsed.cards || defaultBoard.cards).map(
          (card: Card, index: number) => ({
            ...card,
            priority: card.priority || "Medium",
            order: card.order || (index + 1) * 1000,
          })
        ),
        activities: parsed.activities || [],
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("taskflow-board", JSON.stringify(board));
  }, [board]);

  const orderedColumns = useMemo(() => {
    return [...board.columns].sort((a, b) => a.order - b.order);
  }, [board.columns]);

  const cardsByColumn = useMemo(() => {
    return orderedColumns.reduce<Record<string, Card[]>>((acc, column) => {
      acc[column.id] = board.cards
        .filter((card) => card.columnId === column.id)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {});
  }, [board.cards, orderedColumns]);

  const getColumnTitle = (columnId: string) => {
    return board.columns.find((column) => column.id === columnId)?.title || columnId;
  };

  const createActivity = (text: string): Activity => ({
    id: crypto.randomUUID(),
    text,
    time: new Date().toLocaleString(),
  });

  const login = () => {
    if (!authName.trim()) return;
    localStorage.setItem("taskflow-user", authName);
    setUser(authName);
  };

  const logout = () => {
    localStorage.removeItem("taskflow-user");
    setUser("");
  };

  const addColumn = () => {
    const title = prompt("Column name:");
    if (!title) return;

    const maxOrder = Math.max(...board.columns.map((column) => column.order), 0);

    const newColumn: Column = {
      id: crypto.randomUUID(),
      title,
      order: maxOrder + 1000,
    };

    setBoard({
      ...board,
      columns: [...board.columns, newColumn],
      activities: [
        createActivity(`${user} created column "${title}".`),
        ...(board.activities || []),
      ].slice(0, 8),
    });
  };
const editColumn = (columnId: string) => {
  const column = board.columns.find((col) => col.id === columnId);
  if (!column) return;

  const newTitle = prompt("New column name:", column.title);
  if (!newTitle) return;

  setBoard({
    ...board,
    columns: board.columns.map((col) =>
      col.id === columnId ? { ...col, title: newTitle } : col
    ),
    activities: [
      createActivity(`${user} renamed column "${column.title}" to "${newTitle}".`),
      ...(board.activities || []),
    ].slice(0, 8),
  });
};
  const moveColumn = (columnId: string, direction: "left" | "right") => {
    const sortedColumns = [...orderedColumns];
    const currentIndex = sortedColumns.findIndex((column) => column.id === columnId);
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sortedColumns.length) return;

    const moved = [...sortedColumns];
    const [selectedColumn] = moved.splice(currentIndex, 1);
    moved.splice(targetIndex, 0, selectedColumn);

    const reorderedColumns = reorderWithStep(moved);

    setBoard({
      ...board,
      columns: board.columns.map(
        (column) =>
          reorderedColumns.find((updated) => updated.id === column.id) || column
      ),
      activities: [
        createActivity(`${user} changed the order of column "${selectedColumn.title}".`),
        ...(board.activities || []),
      ].slice(0, 8),
    });
  };

  const addCard = (columnId: string) => {
    const title = prompt("Card title:");
    if (!title) return;

    const columnCards = cardsByColumn[columnId] || [];
    const maxOrder = Math.max(...columnCards.map((card) => card.order), 0);

    const newCard: Card = {
      id: crypto.randomUUID(),
      title,
      description: "Click Edit to add more details.",
      columnId,
      label: "General",
      assignee: user || "Ece",
      dueDate: "",
      priority: "Medium",
      order: maxOrder + 1000,
    };

    setBoard({
      ...board,
      cards: [...board.cards, newCard],
      activities: [
        createActivity(`${user} created "${title}" in ${getColumnTitle(columnId)}.`),
        ...(board.activities || []),
      ].slice(0, 8),
    });
  };

  const moveCardWithinColumn = (cardId: string, direction: "up" | "down") => {
    const selectedCard = board.cards.find((card) => card.id === cardId);
    if (!selectedCard) return;

    const columnCards = [...(cardsByColumn[selectedCard.columnId] || [])];
    const currentIndex = columnCards.findIndex((card) => card.id === cardId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= columnCards.length) return;

    const movedCards = [...columnCards];
    const [movedCard] = movedCards.splice(currentIndex, 1);
    movedCards.splice(targetIndex, 0, movedCard);

    const reorderedCards = reorderWithStep(movedCards);

    setBoard({
      ...board,
      cards: board.cards.map(
        (card) => reorderedCards.find((updated) => updated.id === card.id) || card
      ),
      activities: [
        createActivity(`${user} reordered "${selectedCard.title}" in ${getColumnTitle(selectedCard.columnId)}.`),
        ...(board.activities || []),
      ].slice(0, 8),
    });
  };

  const updateCard = () => {
    if (!editingCard) return;

    const oldCard = board.cards.find((card) => card.id === editingCard.id);
    const moved = oldCard && oldCard.columnId !== editingCard.columnId;

    setBoard({
      ...board,
      cards: board.cards.map((card) =>
        card.id === editingCard.id ? editingCard : card
      ),
      activities: [
        createActivity(
          moved && oldCard
            ? `${user} moved "${editingCard.title}" from ${getColumnTitle(
                oldCard.columnId
              )} to ${getColumnTitle(editingCard.columnId)}.`
            : `${user} updated "${editingCard.title}".`
        ),
        ...(board.activities || []),
      ].slice(0, 8),
    });

    setEditingCard(null);
  };

  const deleteCard = () => {
    if (!editingCard) return;

    setBoard({
      ...board,
      cards: board.cards.filter((card) => card.id !== editingCard.id),
      activities: [
        createActivity(`${user} deleted "${editingCard.title}".`),
        ...(board.activities || []),
      ].slice(0, 8),
    });

    setEditingCard(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeCard = board.cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    const overCard = board.cards.find((card) => card.id === overId);
    const overColumn = board.columns.find((column) => column.id === overId);

    const targetColumnId = overCard ? overCard.columnId : overColumn?.id;
    if (!targetColumnId) return;

    const sourceColumnId = activeCard.columnId;
    const sourceColumnCards = cardsByColumn[sourceColumnId] || [];
    const targetColumnCards = cardsByColumn[targetColumnId] || [];

    let updatedCards = [...board.cards];

    if (sourceColumnId === targetColumnId && overCard) {
      const oldIndex = sourceColumnCards.findIndex((card) => card.id === activeId);
      const newIndex = sourceColumnCards.findIndex((card) => card.id === overId);

      const movedCards = arrayMove(sourceColumnCards, oldIndex, newIndex);
      const reorderedCards = reorderWithStep(movedCards);

      updatedCards = updatedCards.map(
        (card) =>
          reorderedCards.find((updated) => updated.id === card.id) || card
      );
    } else {
      const targetWithoutActive = targetColumnCards.filter(
        (card) => card.id !== activeId
      );

      const insertIndex = overCard
        ? targetWithoutActive.findIndex((card) => card.id === overId)
        : targetWithoutActive.length;

      const movedCard = {
        ...activeCard,
        columnId: targetColumnId,
      };

      const newTargetCards = [...targetWithoutActive];
      newTargetCards.splice(insertIndex, 0, movedCard);

      const reorderedTargetCards = reorderWithStep(newTargetCards);

      updatedCards = updatedCards
        .filter((card) => card.id !== activeId)
        .map(
          (card) =>
            reorderedTargetCards.find((updated) => updated.id === card.id) || card
        );

      const finalMovedCard =
        reorderedTargetCards.find((card) => card.id === activeId) || movedCard;

      updatedCards.push(finalMovedCard);
    }

    setBoard({
      ...board,
      cards: updatedCards,
      activities: [
        createActivity(
          `${user} moved "${activeCard.title}" from ${getColumnTitle(
            sourceColumnId
          )} to ${getColumnTitle(targetColumnId)}.`
        ),
        ...(board.activities || []),
      ].slice(0, 8),
    });
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-slate-900">TaskFlow</h1>
          <p className="mt-2 text-slate-500">
            A simple Kanban board for small software teams.
          </p>

          <input
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
            placeholder="Enter your name"
            className="mt-6 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={login}
            className="mt-4 w-full rounded-xl bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
          >
            Login / Register
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Demo authentication is stored locally for this 48-hour case scope.
          </p>
        </div>
      </main>
    );
  }

  return (
<main className="min-h-screen bg-pink-50 p-6">
      <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-pink-100 to-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome, {user}</p>
          <input
            value={board.title}
            onChange={(e) => setBoard({ ...board, title: e.target.value })}
            className="mt-1 w-full bg-transparent text-3xl font-bold text-pink-400 outline-none"
          />
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A lightweight Kanban board built for small software teams. 
            It supports sortable drag-and-drop cards, editable columns, persistent ordering, mobile-friendly movement, and activity tracking.
          </p>
        </div>

        <div className="flex gap-2">
          <button
    onClick={() => {
    localStorage.removeItem("taskflow-board");
    window.location.reload();
  }}
  className="text-sm text-red-500 hover:underline"
>
  Reset Board
</button>
          <button
            onClick={addColumn}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            + Column
          </button>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
          >
            Logout
          </button>
        </div>
      </header>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6">
          {orderedColumns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              cards={cardsByColumn[column.id] || []}
              onAddCard={addCard}
              onEditCard={setEditingCard}
              onMoveCard={moveCardWithinColumn}
              onMoveColumn={moveColumn}
              onEditColumn={editColumn}
            />
          ))}
        </div>
      </DndContext>

  <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Activity Log</h2>
          <p className="mt-1 text-sm text-slate-500">
            Recent board actions are tracked for visibility.
          </p>

          <div className="mt-4 space-y-3">
            {(board.activities || []).length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet. Start by creating or moving a card.</p>
            ) : (
              board.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-slate-200 bg-white hover:shadow-md p-3"
                >
                  <p className="text-sm text-slate-700">{activity.text}</p>
                  <p className="mt-1 text-xs text-slate-400">{activity.time}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Technical Decisions
          </h2>
  <ul className="mt-4 space-y-3 text-sm text-slate-600">
  <li>
    <b>Drag-and-drop library:</b> I chose dnd-kit and dnd-kit sortable because
    they are modern, actively maintained, lightweight, and flexible for custom
    UI. Compared with browser-native drag-and-drop, they provide better control
    over sensors, sorting behavior, and visual feedback.
  </li>
  <li>
    <b>Ordering logic:</b> Each card and column has an <code>order</code> value.
    Items are rendered after sorting by this value, which keeps the order stable
    after refresh. Reordering updates these values in controlled steps, allowing
    cards to be inserted between others.
  </li>
  <li>
    <b>Persistence:</b> Board data is stored in localStorage, including columns,
    cards, order values, priorities, due dates, assignees, and activity history.
    This ensures the board state is preserved without requiring a backend within
    the 48-hour scope.
  </li>
  <li>
    <b>Mobile usability:</b> Drag-and-drop can be unreliable on small touch
    screens. For this reason, I implemented a mobile-only “Move / Change Status”
    action as a reliable fallback while keeping full drag-and-drop on desktop.
  </li>
  <li>
    <b>Column management:</b> Columns can be created, renamed, and reordered.
    This supports a flexible board → column → card data model.
  </li>
  <li>
    <b>Card details:</b> Cards include title, description, priority, label,
    assignee, and due date. These were selected to provide meaningful task
    tracking within the limited time scope.
  </li>
  <li>
    <b>Activity history:</b> Important actions such as moving, editing, deleting,
    and renaming are tracked to make board changes visible and simulate team
    collaboration.
  </li>
  <li>
    <b>Performance:</b> Cards are grouped and sorted using memoized data to avoid
    unnecessary recalculations. For larger boards, virtualization could be
    introduced.
  </li>
  <li>
    <b>Scope decision:</b> Within the 48-hour timeframe, I prioritized building a
    reliable and complete core Kanban experience rather than adding partially
    implemented features.
  </li>
  <li>
    <b>Sharing:</b> Board sharing was considered but left out of the MVP. In a
    production version, I would first implement view-only links, then
    collaborative editing with user permissions.
  </li>
  <li>
    <b>Reset mechanism:</b> Since the application uses localStorage for persistence,
a manual reset option is provided to clear stored data and restore the
default demo state. This is useful for testing and demonstration purposes.
</li>
</ul>
</div>
</section>
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">Edit Card</h2>

            <label className="mt-4 block text-sm font-medium text-slate-600">
              Title
            </label>
            <input
              value={editingCard.title}
              onChange={(e) =>
                setEditingCard({ ...editingCard, title: e.target.value })
              }
              className="mt-1 w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />

            <label className="mt-4 block text-sm font-medium text-slate-600">
              Description
            </label>
            <textarea
              value={editingCard.description}
              onChange={(e) =>
                setEditingCard({
                  ...editingCard,
                  description: e.target.value,
                })
              }
              className="mt-1 h-28 w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />

            <div className="md:hidden mt-4">
              <label className="text-sm font-medium text-slate-600">
                Column / Status
              </label>
              <select
                value={editingCard.columnId}
                onChange={(e) =>
                  setEditingCard({
                    ...editingCard,
                    columnId: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border p-3 outline-none"
              >
                {board.columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Priority
                </label>
                <select
                  value={editingCard.priority}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      priority: e.target.value as Priority,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-3 outline-none"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Label
                </label>
                <input
                  value={editingCard.label}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, label: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border p-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Assignee
                </label>
                <input
                  value={editingCard.assignee}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      assignee: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingCard.dueDate}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      dueDate: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border p-3 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={deleteCard}
                className="rounded-xl bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
              >
                Delete
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCard(null)}
                  className="rounded-xl bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={updateCard}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}