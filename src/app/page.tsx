import GitHubRepos from "@/app/(github)/GitHubRepos";
import Header from "@/components/header";

// A página principal que renderiza o cabeçalho e o componente GitHubRepos.
export default function Page() {
  return (
    <main className="bg-gray-900 min-h-screen">
      {/*Cabeçalho da aplicação*/}
      <Header />

      {/*Componente principal para exibição dos repositórios do GitHub*/}
      <GitHubRepos />
    </main>
  );
}
