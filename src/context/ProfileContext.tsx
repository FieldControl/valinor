import { createContext, ReactNode, useContext, useState } from "react";
import usePersistedState from "../Utils/PersistedState";

type ProfileContextType = {
  profile: string;
  setProfile: (profile: string) => void;
  gitHubUser: ApiData;
  setGitHubUser: (gitHubUser: ApiData) => void;
};

interface ApiData {
  name: string;
  avatar_url: string;
  id: number;
  login: string;
  bio: string;
  html_url: string;
}

interface ProfileContextProps {
  children: ReactNode;
}

const ProfileContext = createContext({} as ProfileContextType);

const ProfileContextProvider = ({ children }: ProfileContextProps) => {
  const [profile, setProfile] = useState("");
  const [gitHubUser, setGitHubUser] = usePersistedState(
    "ProfileContext/@gitHubUser",
    {} as ApiData
  );

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, gitHubUser, setGitHubUser }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

const useProfileContext = () => {
  const context = useContext(ProfileContext);

  return context;
};

export { ProfileContextProvider, useProfileContext };
