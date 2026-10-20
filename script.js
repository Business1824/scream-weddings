const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

$("#year").textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = $(".menu-toggle");
const nav = $(".main-nav");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  nav.classList.toggle("open", open);
});
$$(".main-nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
}));

// Gentle reveal-on-scroll animation, with a graceful fallback.
const revealEls = $$(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), {threshold: .08});
  revealEls.forEach(el => observer.observe(el));
} else revealEls.forEach(el => el.classList.add("visible"));

// Portfolio filtering
$$(".filter").forEach(btn => btn.addEventListener("click", () => {
  $$(".filter").forEach(b => b.classList.toggle("active", b === btn));
  const filter = btn.dataset.filter;
  $$(".story-card").forEach(card => {
    const show = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !show);
  });
}));

// Story modal / lightbox
const storyDialog = $("#story-dialog");
$$(".story-open").forEach(button => button.addEventListener("click", () => {
  const card = button.closest(".story-card");
  $("#dialog-image").src = card.dataset.image;
  $("#dialog-image").alt = card.querySelector("img").alt;
  $("#dialog-title").textContent = card.dataset.title;
  $("#dialog-location").textContent = card.dataset.location;
  storyDialog.showModal();
}));
$(".dialog-close").addEventListener("click", () => storyDialog.close());
storyDialog.addEventListener("click", e => { if (e.target === storyDialog) storyDialog.close(); });
$("#dialog-enquire").addEventListener("click", () => storyDialog.close());

// Journal previews
const articleContent = {
  between: {
    title: "Make room for the moments between the moments.",
    body: "A wedding day is more than its schedule. It is a deep breath before the ceremony, a grandparent adjusting a collar, friends laughing just outside the frame. When you plan your day, leave a little breathing room. Those unscripted minutes often become the photographs you return to most."
  },
  traditions: {
    title: "The small traditions that make a wedding yours.",
    body: "Traditions hold generations of meaning, and every family carries them a little differently. Tell your photo and film team which rituals matter, who should be present, and what the details mean to you. Context helps us document not only what happened, but why it mattered."
  },
  present: {
    title: "How to feel present in front of a camera.",
    body: "You do not need to know how to pose. Stay close to your people, keep talking to each other, and let the day unfold. We will offer direction when it helps and step back when the real moment is already happening. The goal is never perfection; it is recognition."
  }
};
const articleDialog = $("#article-dialog");
$$(".journal-read").forEach(btn => btn.addEventListener("click", () => {
  const item = articleContent[btn.dataset.article];
  $("#article-title").textContent = item.title;
  $("#article-body").textContent = item.body;
  articleDialog.showModal();
}));
$(".article-close").addEventListener("click", () => articleDialog.close());
$$(".dialog-close").forEach(btn => btn.addEventListener("click", e => {
  const d = e.currentTarget.closest("dialog"); if (d?.open) d.close();
}));
articleDialog.addEventListener("click", e => { if (e.target === articleDialog) articleDialog.close(); });

// Enquiry form: validates locally, then prepares an email draft without pretending to store it.
$("#enquiry-form").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const services = data.getAll("service");
  const lines = [
    "New wedding enquiry — Screem Weddings",
    "",
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Phone / WhatsApp: ${data.get("phone")}`,
    `Wedding date: ${data.get("date") || "Not decided yet"}`,
    `Venue / destination: ${data.get("venue") || "Not specified"}`,
    `Services: ${services.join(", ") || "Not selected"}`,
    "",
    "Message:",
    data.get("message") || "No additional message"
  ];
  const subject = encodeURIComponent(`Wedding enquiry from ${data.get("name")}`);
  const body = encodeURIComponent(lines.join("\n"));
  const result = $("#form-result");
  result.textContent = "Your details are ready. Your email app will open with the enquiry prepared; the studio must connect a real inbox or form backend to receive submissions.";
  const mailto = `mailto:?subject=${subject}&body=${body}`;
  const a = document.createElement("a"); a.href = mailto; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
  showToast("Enquiry prepared — connect a studio email before launch.");
});

function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3800);
}

// Keyboard accessibility for native dialogs.
document.addEventListener("keydown", e => {
  if (e.key === "Escape") [storyDialog, articleDialog].forEach(d => { if (d.open) d.close(); });
});
