import { createContext, useContext } from "react";
import minesweeperStore, { MinesweeperStore } from "../store/MinesweeperStore";

const MinesweeperContext = createContext<MinesweeperStore | null>(null);

export const MinesweeperProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <MinesweeperContext.Provider value={minesweeperStore}>
      {children}
    </MinesweeperContext.Provider>
  );
};

export const useMinesweep = () => {
  const store = useContext(MinesweeperContext);
  if (!store) {
    throw new Error("useMinesweep must be used within a MinesweepProvider.");
  }
  return store;
};
