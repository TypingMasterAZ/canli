const menuItems = [
  { category: "secilenler", name: "Yarpaq dolması", description: "Üzüm yarpağı, quzu əti, düyü, göyərti, qatıq", price: "10 ₼", tag: "Sevilən" },
  { category: "secilenler", name: "Göyərti küküsü", description: "Qarışıq göyərtilər, yumurta, süzmə", price: "7 ₼", tag: "Yüngül" },
  { category: "secilenler", name: "Ətli çudu", description: "Dana əti, zirinc, qat-qat xəmir, sumax · 3 ədəd", price: "9 ₼", tag: "Milli dad" },
  { category: "secilenler", name: "Səbzi qovurma", description: "Quzu əti və ətirli göyərtilər", price: "26 ₼", tag: "Klassik" },
  { category: "secilenler", name: "Dovğa", description: "Qatıq, düyü, xama və göyərti", price: "6 ₼", tag: "İsti başlanğıc" },
  { category: "secilenler", name: "Turşu qovurma", description: "Düyü, quzu əti, şabalıd, soğan, albuxara", price: "27 ₼", tag: "Plov" },
  { category: "kabablar", name: "Quzu ətindən lülə", description: "Manqalda bişmiş quzu lüləsi · 2 ədəd", price: "18 ₼", tag: "Manqal" },
  { category: "kabablar", name: "Xan kababı", description: "SHUR menyusunun seçilən kabablarından · 4 ədəd", price: "18 ₼", tag: "Sevilən" },
  { category: "kabablar", name: "Quzu beli", description: "Kömür üzərində hazırlanmış quzu əti · 2 ədəd", price: "18 ₼", tag: "Manqal" },
  { category: "kabablar", name: "Antrekot", description: "Manqalda bişmiş antrekot · 2 ədəd", price: "18 ₼", tag: "Manqal" },
  { category: "kabablar", name: "Kartof lüləsi", description: "Manqalda bişmiş kartof · 3 ədəd", price: "7 ₼", tag: "Qarnirlər" },
  { category: "plovlar", name: "Turşu qovurma", description: "Düyü, quzu əti, şabalıd, soğan, albuxara", price: "27 ₼", tag: "Plov" },
  { category: "plovlar", name: "Səbzi qovurma", description: "Quzu əti və bol göyərti", price: "26 ₼", tag: "Plov" },
  { category: "plovlar", name: "Fisincan", description: "Hind quşu əti, qoz və abqora", price: "27 ₼", tag: "Plov" },
  { category: "enenevi", name: "Yarpaq dolması", description: "Quzu əti, düyü, göyərti və qatıq", price: "10 ₼", tag: "Milli mətbəx" },
  { category: "enenevi", name: "Düşbərə", description: "Quzu əti, toyuq bulyonu, keşniş", price: "10 ₼", tag: "Şorba" },
  { category: "enenevi", name: "Ətli çudu", description: "Dana əti, zirinc, qat-qat xəmir, sumax · 3 ədəd", price: "9 ₼", tag: "Xəmir işi" },
  { category: "enenevi", name: "Qutab · göyərti", description: "Göyərti, zirinc və kərə yağı", price: "2 ₼", tag: "Xəmir işi" },
  { category: "enenevi", name: "Qutab · balqabaq", description: "Balqabaq, zirinc və kərə yağı", price: "2 ₼", tag: "Xəmir işi" },
];

const grid = document.querySelector("#menu-grid");
const tabs = [...document.querySelectorAll(".menu-tab")];

function renderMenu(category = "secilenler") {
  const items = menuItems.filter((item) => item.category === category);
  grid.innerHTML = items.map((item, index) => `
    <article class="menu-card" style="animation-delay:${index * 55}ms">
      <div><h3>${item.name}</h3><p>${item.description}</p></div>
      <span class="menu-price">${item.price}</span>
    </article>
  `).join("");
}

tabs.forEach((tab) => tab.addEventListener("click", () => {
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });
  renderMenu(tab.dataset.category);
}));
renderMenu();

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Menyunu bağla" : "Menyunu aç");
  mainNav.classList.toggle("is-open", open);
});
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Menyunu aç");
  mainNav.classList.remove("is-open");
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const progress = document.querySelector(".scroll-progress span");
const floatingBook = document.querySelector(".floating-book");
const siteHeader = document.querySelector(".site-header");
function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 28);
  floatingBook.classList.toggle("is-visible", window.scrollY > 560);
}
window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

const dateInput = document.querySelector('input[name="date"]');
const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
dateInput.min = localDate;
dateInput.value = localDate;

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = [
    "Salam, SHUR-da masa sifariş etmək istəyirəm.",
    `Ad: ${data.get("name")}`,
    `Qonaq sayı: ${data.get("guests")}`,
    `Tarix: ${data.get("date")}`,
    `Saat: ${data.get("time")}`,
  ].join("\n");
  window.open(`https://wa.me/994777221050?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => {
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}));
