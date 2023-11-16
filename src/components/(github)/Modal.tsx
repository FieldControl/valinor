import { TIssue } from "@/types/issues";
import { TRepository } from "@/types/repository";
import React, { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoDetails: TRepository | null;
  issues?: TIssue[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  repoDetails,
  issues,
}) => {
  // State to manage active tab and selected issue
  const [activeTab, setActiveTab] = useState("details");
  const [selectedIssue, setSelectedIssue] = useState<TIssue | null>(null);

  // Return null if modal is not open
  if (!isOpen) return null;

  // Function to handle issue click
  const handleIssueClick = (issue: TIssue) => {
    setSelectedIssue(issue);
    setActiveTab("issueDetail");
  };

  return (
    <div className="fixed inset-0 min-h-[30vh] bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
      <section className="bg-gray-800 rounded-md w-full max-w-4xl p-6 relative flex">
        {/* Barra de navegação lateral */}
        <aside className="flex flex-col w-1/5 h-auto bg-gray-700 p-4 rounded-l-md space-y-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`${
              activeTab === "details" ? "text-white" : "text-gray-400"
            }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={activeTab === "issues" ? "text-white" : "text-gray-400"}
          >
            Issues
          </button>
          {selectedIssue && (
            <button
              onClick={() => setActiveTab("issueDetail")}
              className={
                activeTab === "issueDetail" ? "text-white" : "text-gray-400"
              }
            >
              Informações
            </button>
          )}
        </aside>

        {/* Conteúdo do modal */}
        <div className="w-3/4 p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white text-2xl"
          >
            &times;
          </button>

          {/* Área de detalhes */}
          {activeTab === "details" && repoDetails && (
            <section className="text-white min-h-[60vh]">
              <div className="bg-gray-600 p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-2xl font-bold mb-2">{repoDetails.name}</h3>
                <p className="text-gray-300 mb-4">{repoDetails.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Informações Básicas */}
                <div className="bg-gray-600 p-4 rounded-lg shadow-md">
                  <p>
                    <strong>Stars:</strong> {repoDetails.stargazers_count}
                  </p>
                  <p>
                    <strong>Watchers:</strong> {repoDetails.watchers_count}
                  </p>
                  <p>
                    <strong>Forks:</strong> {repoDetails.forks_count}
                  </p>
                  <p>
                    <strong>Linguagem Principal:</strong> {repoDetails.language}
                  </p>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-gray-600 p-4 rounded-lg shadow-md">
                  <p>
                    <strong>Criado em:</strong>{" "}
                    {new Date(repoDetails.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Última Atualização:</strong>{" "}
                    {new Date(repoDetails.updated_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Tamanho:</strong> {repoDetails.size} KB
                  </p>
                </div>
              </div>

              {/* Funcionalidades do Repositório */}
              <div className="bg-gray-600 p-4 rounded-lg shadow-md mb-4 flex flex-row justify-between">
                <aside>
                  <p>
                    <strong>Issues:</strong>{" "}
                    {repoDetails.has_issues ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Projetos:</strong>{" "}
                    {repoDetails.has_projects ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Wiki:</strong>{" "}
                    {repoDetails.has_wiki ? "Sim" : "Não"}
                  </p>
                </aside>

                <div className="flex flex-col space-y-2">
                  {/* Botão para visitar o repositório */}
                  {repoDetails.html_url && (
                    <a
                      href={repoDetails.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                      Visitar repositório
                    </a>
                  )}

                  {/* Botão para mostrar as issues */}
                  {repoDetails.has_issues && (
                    <button
                      onClick={() => setActiveTab("issues")}
                      className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                      Visualizar issues
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Área de Issues */}
          {activeTab === "issues" && issues && (
            <section className="text-white overflow-auto max-h-[60vh]">
              {issues.map((issue) => (
                <div key={issue.id} className="p-4 mb-4 bg-gray-700 rounded-md">
                  <div className="flex justify-between">
                    <h5 className="text-lg font-bold">{issue.title}</h5>
                    <button
                      onClick={() => handleIssueClick(issue)}
                      className="text-blue-300 hover:text-blue-500"
                    >
                      Detalhes
                    </button>
                  </div>
                  {issue.user && (
                    <p className="text-gray-300">
                      Criado por: {issue.user.login}
                    </p>
                  )}
                  {/* Renderize aqui a seção expandida com detalhes da issue */}
                </div>
              ))}
            </section>
          )}

          {/* Área de detalhes da Issue */}
          {activeTab === "issueDetail" && selectedIssue && (
            <section className="text-white p-4 bg-gray-700 rounded-md overflow-auto max-h-[60vh]">
              <h3 className="text-xl font-bold mb-2">{selectedIssue.title}</h3>
              <p className="text-gray-300 mb-2">{selectedIssue.body}</p>

              {/* Informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-600 p-4 rounded-lg shadow-md">
                  <p className="font-semibold text-lg text-white mb-2">
                    Informações Gerais
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>ID:</strong> {selectedIssue.id}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>Estado:</strong> {selectedIssue.state}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>Criado em:</strong>{" "}
                    {new Date(selectedIssue.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>Atualizado em:</strong>{" "}
                    {new Date(selectedIssue.updated_at).toLocaleDateString()}
                  </p>
                  {selectedIssue.closed_at && (
                    <p className="text-gray-300 mb-1">
                      <strong>Fechado em:</strong>{" "}
                      {new Date(selectedIssue.closed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="bg-gray-600 p-4 rounded-lg shadow-md">
                  <p className="font-semibold text-lg text-white mb-2">
                    Detalhes do Autor
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>Autor:</strong> {selectedIssue.user.login}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>Comentários:</strong> {selectedIssue.comments}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <strong>Número da Issue:</strong> {selectedIssue.number}
                  </p>
                  {selectedIssue.assignee && (
                    <p className="text-gray-300 mb-1">
                      <strong>Responsável:</strong>{" "}
                      {selectedIssue.assignee.login}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <a
                  href={selectedIssue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Ver no GitHub
                </a>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
};

export default Modal;
