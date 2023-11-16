import axios from "@/config/api/axios";
import { TIssue } from "@/types/issues";
import { useEffect, useState } from "react";

const useIssues = (repoFullName?: string) => {
  const [issues, setIssues] = useState<TIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!repoFullName) {
      setIssues([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        // Utilize o endpoint de busca com os parâmetros apropriados
        const response = await axios.get(`/issues?q=repo:${repoFullName}`);
        // Supondo que a resposta da busca esteja no campo 'items'
        setIssues(response.data.items);
      } catch (error) {
        console.log(error);
        setError(error as Error);
      }
      setLoading(false);
    };

    fetchIssues();
  }, [repoFullName]);

  return { issues, loading, error };
};

export default useIssues;
