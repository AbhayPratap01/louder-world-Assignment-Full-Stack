import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const statusStyles = {
  new: "status status--new",
  updated: "status status--updated",
  inactive: "status status--inactive",
  imported: "status status--imported",
};

const formatDate = (value) => {
  if (!value) return "TBA";
  return new Date(value).toLocaleString("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function App() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Sydney");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [emailData, setEmailData] = useState({
    email: "",
    consent: false,
  });
  const [importNotes, setImportNotes] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchEvents = async () => {
    const params = new URLSearchParams({
      city,
      q: query,
      start: filters.start,
      end: filters.end,
      status: statusFilter,
    });
    try {
      const endpoint = isAuthenticated ? "/api/admin/events" : "/api/events";
      const response = await fetch(`${API_BASE}${endpoint}?${params.toString()}`, {
        credentials: isAuthenticated ? "include" : "omit",
      });
      if (!response.ok) {
        throw new Error("Failed to load events");
      }
      const data = await response.json();
      setEvents(data);
      setSelectedEvent(data[0] || null);
    } catch (error) {
      if (!isAuthenticated) {
        const fallback = [
          {
            _id: "sample-1",
            title: "Sydney Harbour Night Market",
            startsAt: new Date().toISOString(),
            venueName: "Circular Quay",
            description: "Local food, live jazz, and artisan stalls by the water.",
            sourceName: "Sample Source",
            status: "new",
            imageUrl:
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
          },
        ];
        setEvents(fallback);
        setSelectedEvent(fallback[0]);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [query, city, filters, statusFilter, isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      setIsAuthenticated(response.ok);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && viewMode === "table") {
      setViewMode("cards");
    }
  }, [isAuthenticated, viewMode]);

  const summary = useMemo(() => {
    return `${events.length} events in ${city}`;
  }, [events, city]);

  const handleSubscribe = async (event) => {
    setIsSending(true);
    const response = await fetch(`${API_BASE}/api/events/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event._id,
        email: emailData.email,
        consent: emailData.consent,
      }),
    });
    const data = await response.json();
    setIsSending(false);

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  };

  const handleImport = async () => {
    if (!selectedEvent) return;
    await fetch(`${API_BASE}/api/admin/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        eventId: selectedEvent._id,
        importNotes,
      }),
    });
    fetchEvents();
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Sydney, Australia</p>
          <h1>Discover curated events updated hourly.</h1>
          <p className="subtitle">
            Open-source scraping pipeline → clean listings → admin review.
          </p>
        </div>
        <div className="hero__actions">
          <button
            className="ghost"
            onClick={() => (window.location.href = `${API_BASE}/auth/google`)}
          >
            {isAuthenticated ? "Dashboard Access Granted" : "Sign in with Google"}
          </button>
        </div>
      </header>

      <section className="filters">
        <div>
          <label>City</label>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
          </select>
        </div>
        <div>
          <label>Keyword</label>
          <input
            placeholder="Search title, venue, description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div>
          <label>Date range</label>
          <div className="date-range">
            <input
              type="date"
              value={filters.start}
              onChange={(event) =>
                setFilters((current) => ({ ...current, start: event.target.value }))
              }
            />
            <span>→</span>
            <input
              type="date"
              value={filters.end}
              onChange={(event) =>
                setFilters((current) => ({ ...current, end: event.target.value }))
              }
            />
          </div>
        </div>
        {isAuthenticated ? (
          <div>
            <label>Status</label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="updated">Updated</option>
              <option value="inactive">Inactive</option>
              <option value="imported">Imported</option>
            </select>
          </div>
        ) : null}
        <div className="summary">{summary}</div>
        <div className="view-toggle">
          <button
            type="button"
            className={viewMode === "cards" ? "primary" : "ghost"}
            onClick={() => setViewMode("cards")}
          >
            Card view
          </button>
          <button
            type="button"
            className={viewMode === "table" ? "primary" : "ghost"}
            onClick={() => setViewMode("table")}
            disabled={!isAuthenticated}
          >
            Table view
          </button>
        </div>
      </section>

      <main className="layout">
        <section className="events">
          {!isAuthenticated && viewMode === "cards" ? (
            <div className="cards">
              {events.map((event) => (
                <article
                  key={event._id}
                  className={`card ${selectedEvent?._id === event._id ? "card--active" : ""}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <img src={event.imageUrl} alt={event.title} />
                  <div>
                    <div className={statusStyles[event.status] || "status"}>
                      {event.status}
                    </div>
                    <h3>{event.title}</h3>
                    <p className="muted">{formatDate(event.startsAt)}</p>
                    <p className="muted">{event.venueName || "Venue TBA"}</p>
                    <p className="description">{event.description || "Details coming soon."}</p>
                    <span className="source">Source: {event.sourceName}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className={selectedEvent?._id === event._id ? "row--active" : ""}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td>
                        <span className={statusStyles[event.status] || "status"}>
                          {event.status}
                        </span>
                      </td>
                      <td>{event.title}</td>
                      <td>{formatDate(event.startsAt)}</td>
                      <td>{event.venueName || "Venue TBA"}</td>
                      <td>{event.sourceName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="preview">
          {selectedEvent ? (
            <div>
              <h2>{selectedEvent.title}</h2>
              <p className="muted">{formatDate(selectedEvent.startsAt)}</p>
              <p className="muted">
                {selectedEvent.venueName || "Venue TBA"} · {selectedEvent.venueAddress}
              </p>
              <p>{selectedEvent.description || "Description coming soon."}</p>
              {selectedEvent.importedAt ? (
                <p className="muted">
                  Imported {new Date(selectedEvent.importedAt).toLocaleDateString()} by{" "}
                  {selectedEvent.importedBy || "admin"}
                </p>
              ) : null}
              <div className="tag-row">
                {(selectedEvent.categories || []).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="cta">
                  <label>Import notes</label>
                  <input
                    type="text"
                    placeholder="Optional notes"
                    value={importNotes}
                    onChange={(event) => setImportNotes(event.target.value)}
                  />
                  <button className="secondary" onClick={handleImport}>
                    Import to platform
                  </button>
                </div>
              ) : (
                <form
                  className="cta"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubscribe(selectedEvent);
                  }}
                >
                  <label>Email for tickets</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={emailData.email}
                    onChange={(event) =>
                      setEmailData((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={emailData.consent}
                      onChange={(event) =>
                        setEmailData((current) => ({
                          ...current,
                          consent: event.target.checked,
                        }))
                      }
                    />
                    I agree to receive updates about this event.
                  </label>
                  <button className="primary" type="submit" disabled={isSending}>
                    {isSending ? "Sending..." : "GET TICKETS"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p>No events yet.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
