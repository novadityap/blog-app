/* eslint-disable react/no-unescaped-entities */
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
  NavbarLink,
  Button,
  TextInput,
} from "flowbite-react";
import { NavLink } from "react-router-dom";
import { TbSearch, TbX } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const path = useLocation().pathname;
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    setIsOpen(!isOpen);
  };

  console.log(isOpen);  

  return (
    <>
      <Navbar className="border-b-2" rounded>
        
        {isOpen ? (
          <div className="w-full flex text-center gap-x-2">
            <TextInput
              className="w-full"
            rightIcon={TbSearch}
            placeholder="Search..."
          />
            <div className="flex items-center">
              <TbX className="cursor-pointer size-6" onClick={handleSearch}/>
            </div>
          </div>
        ) : (
          <>
            <NavbarBrand as={NavLink} to="/">
              <span className="px-3 py-1 mr-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold">
                Aditya's
              </span>
              <span className="font-semibold">Blog</span>
            </NavbarBrand>
            <TextInput
              className="hidden sm:inline"
              rightIcon={TbSearch}
              placeholder="Search..."
            />
            <div className="flex md:max-2xl:order-2">
              <Button
                size="sm"
                className="sm:hidden flex items-center"
                color="gray"
                pill
                onClick={handleSearch}
              >
                <TbSearch />
              </Button>
              <NavLink className="hidden md:inline-block">
                <Button
                  size="sm"
                  outline
                  gradientDuoTone="purpleToPink"
                >
                  Sign In
                </Button>
              </NavLink>
              <NavbarToggle />
            </div>
            <NavbarCollapse>
              <NavbarLink as={NavLink} to="/" active={path === "/"}>
                Home
              </NavbarLink>
              <NavbarLink as={NavLink} to="/about" active={path === "/about"}>
                About
              </NavbarLink>
              <NavbarLink as={NavLink} to="/projects" active={path === "/projects"}>
                Projects
              </NavbarLink>
              <NavbarLink as={NavLink} to="/signin" active={path === "/signin"} className="inline-block md:hidden">
                Sign In
              </NavbarLink>
            </NavbarCollapse>
          </>
        )}
      </Navbar>
    </>
  );
};

export default Header;
