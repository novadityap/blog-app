import { Footer as BaseFooter } from 'flowbite-react';
import { Link } from 'react-router-dom';
import {
  TbBrandGithub,
  TbBrandLinkedin,
  TbBrandInstagram,
} from 'react-icons/tb';
const Footer = () => {
  return (
    <BaseFooter className="py-6 px-2 border-t-2 border-purple-500 ">
      <div className="container mx-auto grid md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
        <Link to="/">
          <div className="text-2xl font-semibold sm:mt-4">
            <span className="px-3 py-1 mr-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              Aditya's
            </span>
            <span>Blog</span>
          </div>
        </Link>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 my-6 sm:my-0">
          <div>
            <BaseFooter.Title title="about" className="mt-3 mb-2 md:mb-6" />
            <BaseFooter.LinkGroup col className="space-y-2">
              <BaseFooter.Link href="#">Blog App</BaseFooter.Link>
            </BaseFooter.LinkGroup>
          </div>
          <div>
            <BaseFooter.Title title="Follow us" className="mt-3 mb-2 md:mb-6" />
            <BaseFooter.LinkGroup col className="space-y-2">
              <BaseFooter.Link href="https://github.com/novadityap">
                Github
              </BaseFooter.Link>
              <BaseFooter.Link href="https://www.linkedin.com/in/nova-aditya-17525b297">
                LinkedIn
              </BaseFooter.Link>
              <BaseFooter.Link href="#">Instagram</BaseFooter.Link>
            </BaseFooter.LinkGroup>
          </div>
          <div>
            <BaseFooter.Title title="Legal" className="mt-3 mb-2 md:mb-6" />
            <BaseFooter.LinkGroup col className="space-y-2">
              <BaseFooter.Link href="#">Privacy Policy</BaseFooter.Link>
              <BaseFooter.Link href="#">Terms &amp; Conditions</BaseFooter.Link>
            </BaseFooter.LinkGroup>
          </div>
        </div>
        <div className="w-full flex items-center flex-col sm:gap-y-3 sm:col-span-2 sm:mt-6">
          <BaseFooter.Copyright
            by="Aditya's Blog"
            year={new Date().getFullYear()}
          />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            <BaseFooter.Icon
              href="https://github.com/novadityap"
              icon={TbBrandGithub}
            />
            <BaseFooter.Icon
              href="https://www.linkedin.com/in/nova-aditya-17525b297"
              icon={TbBrandLinkedin}
            />
            <BaseFooter.Icon href="#" icon={TbBrandInstagram} />
          </div>
        </div>
      </div>
    </BaseFooter>
  );
};

export default Footer;
