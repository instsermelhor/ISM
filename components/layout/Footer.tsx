import React from 'react';
import { Leaf, Mail, MapPin, Phone, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-900 text-white pt-16 pb-8 border-t-4 border-brand-600">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="text-brand-500" size={32} />
              <h3 className="text-2xl font-bold">Instituto Ser Melhor</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Trabalhando desde 2007 para conectar pessoas, natureza e sustentabilidade em prol de um futuro regenerativo.
            </p>
            <div className="flex gap-4 pt-2">
              {[Instagram, Facebook, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-brand-400 transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 border-l-4 border-brand-500 pl-3">Institucional</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="#mission" className="hover:text-brand-400 transition-colors">Nossa Missão</a></li>
              <li><a href="#governance" className="hover:text-brand-400 transition-colors">Conselho e Diretoria</a></li>
              <li><a href="#transparency" className="hover:text-brand-400 transition-colors">Relatórios Anuais</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Imprensa</a></li>
            </ul>
          </div>

          {/* Projects Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 border-l-4 border-brand-500 pl-3">Nossas Causas</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-brand-400 transition-colors">Educação</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Educação Ambiental</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Preservação Ambiental</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Proteção Animal</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Justiça Social</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Desenvolvimento Social</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 border-l-4 border-brand-500 pl-3">Contato</h4>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-500 shrink-0 mt-1" />
                <span>Av. Henry Ford, S/N   Presidente Altino<br />Osasco - SP, 06210-900</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand-500 shrink-0" />
                <span>+55 (11) 96276-5715</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand-500 shrink-0" />
                <span>contato@institutosermelhor.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; 2026 Instituto Ser Melhor. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};