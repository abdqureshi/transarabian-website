import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo-navbar.png";

const links = [["/","Home"],["/about","About Us"],["/services","Services"],["/process","Process"],["/jobs","Current Jobs"],["/hire","Hire Manpower"],["/facilities","Facilities"],["/gallery","Gallery"],["/contact","Contact"],["/account","Portal"]];

export default function Navbar() {
  const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>20);window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
  return <header className={`navbar ${scrolled?"navbar-scrolled":""}`}><Link to="/" className="logo-link" aria-label="Trans Arabian home"><img src={logo} alt="Trans Arabian Travel & Trade" className="navbar-logo"/></Link><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}><i></i><i></i><i></i></button><nav className={open?"nav-open":""} aria-label="Main navigation">{links.map(([to,label])=><NavLink end={to==="/"} className={({isActive})=>`${isActive?"active":""} ${to==="/hire"?"nav-cta":""}`} onClick={()=>setOpen(false)} to={to} key={to}>{label}</NavLink>)}</nav></header>;
}
