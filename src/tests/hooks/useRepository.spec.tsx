import { renderHook } from "@testing-library/react-hooks"
import { useRepository ,RepositoryProvider} from "../../hooks/useRepository"

describe('Reposiotries Hook', () => {
   it('Should be able to list Repositories', () => {
   const { result } = renderHook(() => useRepository(),{
     wrapper: RepositoryProvider,
   }); 
    
   console.log(result.current);
   
 
   });
});