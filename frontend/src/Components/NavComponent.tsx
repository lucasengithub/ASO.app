interface NavBarProps {
  active: string;
  setActive: (name: string) => void;
}

const navItems = [
  { name: "AADM", icon: "groups" },
  { name: "Inicio", icon: "home" },
  { name: "Escuela", icon: "school" },
];

export default function NavBar({ active, setActive }: NavBarProps) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 w-full h-16 bg-white border-t border-green-400 flex justify-around items-center z-50
        md:top-0 md:left-0 md:h-screen md:w-20 md:flex-col md:justify-start md:border-t-0 md:border-r
      "
    >
      {navItems.map((item) => (
        <button
          key={item.name}
          onClick={() => setActive(item.name)}
          className={`
            flex flex-col items-center justify-center text-green-500 hover:text-green-700 transition-colors
            md:my-6 outline-none
            ${active === item.name ? "font-bold text-green-700" : ""}
          `}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span className="material-symbols-outlined text-2xl">
            {item.icon}
          </span>
          <span className="text-xs md:hidden">{item.name}</span>
        </button>
      ))}
    </nav>
  );
}