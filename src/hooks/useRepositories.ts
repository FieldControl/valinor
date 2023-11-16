import { useState, useEffect } from "react";
import axios from "@/config/api/axios";
import { TRepository } from "@/types/repository";

const useRepositories = (
    query: string,
    page: number,
    itemsPerPage: number = 10
  ) => {
    const [repositories, setRepositories] = useState<TRepository[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any | null>(null);
    const [totalItems, setTotalItems] = useState<number>(0);
  
    useEffect(() => {
      // Função assíncrona dentro do useEffect
      const fetchData = async () => {
        if (query) {
          setLoading(true);
          try {
            const response = await axios.get(`/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=${itemsPerPage}`);
            setRepositories(response.data.items);
            setTotalItems(response.data.total_count)
          } catch (error) {
            setError(error);
          } finally {
            setLoading(false);
          }
        }
      };
  
      fetchData();
    }, [query, page, itemsPerPage]);
  
    return { repositories, loading, error, totalItems };
  };
  
  export default useRepositories;
  
