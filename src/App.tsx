import { cva, type VariantProps } from "class-variance-authority";
import "./App.css";
import { useMinesweep } from "./context/minesweeperContext";
import { Cell, Settings } from "./store/MinesweeperStore";
import { observer } from "mobx-react-lite";
import React, { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";
import { Slot } from "@radix-ui/react-slot";
import * as Menubar from "@radix-ui/react-menubar";
import { DotFilledIcon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [open, setOpen] = React.useState(true);
  const [active, setActive] = React.useState(true);

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="flex flex-col gap-1 justify-center items-center group outline-none">
        <img
          className="h-16 w-16 group-focus:bg-blue-600/30 group-focus:border group-focus:border-blue-500/50 rounded-sm p-2"
          src="minesweeper.png"
        />
        <span className="text-xs font-medium tracking-tight p-1 group-focus:bg-blue-600 rounded-sm group-focus:text-white">
          Minesweeper
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        <Dialog.Content
          className="w-min fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
          onClick={() => setActive(true)}
          onPointerDownOutside={(e) => {
            e.preventDefault();
            setActive(false);
          }}
        >
          <DialogDiv>
            <HeaderBar active={active}>
              <span className="text-gray-50">404 Page Not Found</span>
              <HeaderButtonGroup closeDialog={closeDialog} />
            </HeaderBar>
            <Toolbar closeDialog={closeDialog} />
            <GameDiv>
              <ObservedScoreControlDiv />
              <ObservedGameGrid />
            </GameDiv>
          </DialogDiv>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const ObservedGameGrid = observer(GameGrid);

function GameGrid() {
  const { board, initialLoad, setInitialLoadFalse } = useMinesweep();
  const [showCursor, setShowCursor] = React.useState(true);

  const handleAnimationCompletion = () => {
    const cell = document.getElementById("cell-817");

    if (cell) {
      cell.classList.add(
        "shadow-[inset_0px_0px_0px_0.5px_rgba(0,0,0,0.25),inset_-1px_-1px_0.5px_0.75px_rgba(206,206,206,0.25),inset_1px_1px_0.75px_0.5px_rgba(144,144,144,0.75)]"
      );
      setTimeout(() => {
        cell.classList.remove(
          "shadow-[inset_0px_0px_0px_0.5px_rgba(0,0,0,0.25),inset_-1px_-1px_0.5px_0.75px_rgba(206,206,206,0.25),inset_1px_1px_0.75px_0.5px_rgba(144,144,144,0.75)]"
        );
        cell.click();
        setInitialLoadFalse();
      }, 175);
    }
  };

  return (
    <GridDiv>
      <AnimatePresence>
        {initialLoad && (
          <motion.div
            className="absolute"
            initial={{ x: 500, y: 250, opacity: 0 }}
            animate={{ x: 420, y: 205, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.5 },
              x: { delay: 0.5, duration: 1, type: "tween" },
              y: { delay: 0.5, duration: 1, type: "tween" },
            }}
            onAnimationComplete={handleAnimationCompletion}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-blue-600 shadow-sm"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                stroke="white"
              />
            </svg>
            <div className="bg-gradient-to-b shadow-sm from-blue-600 to-blue-700 text-white ml-3 -mt-1 p-0.5 px-1 rounded-sm">
              Andy Brooker
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell) => (
            <ObservedCellComponent
              cell={cell}
              key={`X${cell.column}Y${cell.row}`}
            ></ObservedCellComponent>
          ))}
        </div>
      ))}
    </GridDiv>
  );
}

const ObservableGameState = observer(GameState);

function GameState() {
  const minesweeper = useMinesweep();

  return (
    <Button onClick={() => minesweeper.startNewGame()} size="large">
      <div className="h-full w-full flex items-center justify-center">
        <img
          className="mt-[2px] h-6 w-6"
          src={
            minesweeper.gameOver
              ? minesweeper.win
                ? "win.png"
                : "gameover.png"
              : "smiley.png"
          }
        />
      </div>
    </Button>
  );
}

function Score({ number }: { number: number }) {
  return (
    <div className="relative calculator text-2xl bg-black text-red-600 rounded-sm">
      {String(number).padStart(3, "0")}
      <span className="absolute inset-0 text-red-600/50">888</span>
    </div>
  );
}

function GameDiv({ children }: React.PropsWithChildren) {
  return (
    <div className="flex p-2 flex-col items-start gap-2.5 bg-[#C0C0C0] shadow-[inset_2px_2px_4px_0.5px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_0.5px_rgba(0,0,0,0.25)]">
      {children}
    </div>
  );
}

function GridDiv({ children }: React.PropsWithChildren) {
  return (
    <div className="flex p-1 flex-col items-start bg-[#C0C0C0] shadow-[inset_2px_2px_4px_0.5px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_0.5px_rgba(255,255,255,0.6)]">
      {children}
    </div>
  );
}

function ScoreControlDiv() {
  const { minesRemaining, timeElapsed } = useMinesweep();

  return (
    <div className="p-2.5 flex justify-between self-stretch items-center bg-[#C0C0C0] shadow-[inset_-2px_-2px_4px_0.5px_rgba(255,255,255,0.6),inset_2px_2px_4px_0.5px_rgba(0,0,0,0.25)]">
      <Score number={minesRemaining} />
      <ObservableGameState />
      <Score number={timeElapsed} />
    </div>
  );
}

const ObservedScoreControlDiv = observer(ScoreControlDiv);

function Toolbar({ closeDialog }: { closeDialog: () => void }) {
  const { startNewGame } = useMinesweep();

  return (
    <Menubar.Root className="flex items-start self-stretch gap-2 py-[2px]">
      <Menubar.Menu>
        <Menubar.Trigger
          className="
        h-full px-3 py-1.5 
        data-[state='open']:shadow-[inset_0px_0px_0px_0.5px_rgba(0,0,0,0.25),inset_-1px_-1px_0.5px_0.75px_rgba(206,206,206,0.25),inset_1px_1px_0.75px_0.5px_rgba(144,144,144,0.75)] 
        active:shadow-[inset_0px_0px_0px_0.5px_rgba(0,0,0,0.25),inset_-1px_-1px_0.5px_0.75px_rgba(206,206,206,0.25),inset_1px_1px_0.75px_0.5px_rgba(144,144,144,0.75)] 
        hover:shadow-[inset_0_1px_0.75px_0.5px_rgba(222,222,222,0.5),inset_0_0_0_0.5px_rgba(0,0,0,0.25),inset_0_-1px_0.5px_0.75px_rgba(206,206,206,0.15),0_0_0_0_rgba(0,0,0,0.25),0_0_1px_0_rgba(0,0,0,0.25),0_2px_2px_0_rgba(0,0,0,0.22)]"
        >
          <u>G</u>ame
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className="
          bg-[#C0C0C0]
          shadow-[inset_0_1px_0.75px_0.5px_rgba(222,222,222,0.5),inset_0_0_0_0.5px_rgba(0,0,0,0.25),inset_0_-1px_0.5px_0.75px_rgba(206,206,206,0.15),0_0_0_0_rgba(0,0,0,0.25),0_0_1px_0_rgba(0,0,0,0.25),0_2px_2px_0_rgba(0,0,0,0.22)]"
          >
            <Menubar.Item
              onSelect={startNewGame}
              className="relative pl-5 text-xs font-normal tracking-tight py-[3px] pr-8 data-[highlighted]:bg-gradient-to-b data-[highlighted]:from-blue-600 data-[highlighted]:to-blue-700 data-[highlighted]:text-white outline-none focus-visible:bg-gradient-to-b focus-visible:from-blue-600 focus-visible:to-blue-700"
            >
              <u>N</u>ew Game
            </Menubar.Item>
            <Menubar.Separator className="h-[1px] bg-gray-400 shadow-[0_1px_0.5px_0_white] overflow-hidden" />
            <ObservedSettings />
            <Menubar.Separator className="h-[1px] bg-gray-400 shadow-[0_1px_0.5px_0_white] overflow-hidden" />
            <Menubar.Item
              onSelect={closeDialog}
              className="relative pl-5 text-xs font-normal tracking-tight py-[3px] pr-8 data-[highlighted]:bg-gradient-to-b data-[highlighted]:from-blue-600 data-[highlighted]:to-blue-700 data-[highlighted]:text-white outline-none"
            >
              <u>E</u>xit
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

const SettingsRadioGroup = () => {
  const { currentSetting, changeSetting, settings } = useMinesweep();

  return (
    <Menubar.RadioGroup
      value={currentSetting}
      onValueChange={(value) => changeSetting(value as keyof Settings)}
    >
      {Object.keys(settings).map((item) => (
        <Menubar.RadioItem
          className="relative pl-5 text-xs font-normal tracking-tight py-[3px] pr-8 hover:bg-gradient-to-b hover:from-blue-600 hover:to-blue-700 hover:text-white outline-none  focus-visible:bg-gradient-to-b focus-visible:from-blue-600 focus-visible:to-blue-700 focus-visible:text-white"
          key={item}
          value={item}
        >
          <Menubar.ItemIndicator className="absolute left-0 w-5 h-full top-0 inline-flex items-center justify-center ">
            <DotFilledIcon />
          </Menubar.ItemIndicator>
          <u>{item[0].toLocaleUpperCase()}</u>
          {item.slice(1)}
        </Menubar.RadioItem>
      ))}
    </Menubar.RadioGroup>
  );
};

const ObservedSettings = observer(SettingsRadioGroup);

function DialogDiv({ children }: React.PropsWithChildren) {
  return (
    <div className="text-xs tracking-tight max-w-min font-medium p-1 bg-[#C0C0C2] flex flex-col shadow-[inset_0_1px_0.5px_0.75px_rgba(255,255,255,0.5)]">
      {children}
    </div>
  );
}

function HeaderButtonGroup({ closeDialog }: { closeDialog: () => void }) {
  const { startNewGame } = useMinesweep();

  return (
    <div className="flex gap-1">
      <div className="flex">
        <Button onClick={closeDialog}>
          <div className="font-black mb-[2px]">_</div>
        </Button>
        <Button>
          <div className="border-2 border-t-[3px] border-[#7E7E7E] h-[16px] aspect-square bg-[#B7B7B7] shadow-[inset_1px_1px_2px_0.5px_rgba(255,255,255,0.2)]"></div>
        </Button>
      </div>
      <Button
        onClick={() => {
          closeDialog();
          startNewGame();
        }}
      >
        <div className="font-black">✕</div>
      </Button>
    </div>
  );
}

type HeaderProps = {
  active: boolean;
};

function HeaderBar({ active, children }: React.PropsWithChildren<HeaderProps>) {
  return (
    <div
      className={`${
        active
          ? "bg-[radial-gradient(100.00%_900%_at_0.00%_50.00%,#000079_0%,#008BDB_100%)]"
          : "bg-[radial-gradient(100.00%_900%_at_0.00%_50.00%,#333333_0%,#888888_100%)]"
      } p-1.5 w-full flex justify-between self-stretch items-center`}
    >
      {children}
    </div>
  );
}

const buttonVariants = cva("flex justify-center items-center", {
  variants: {
    variant: {
      default:
        "aspect-square transition-shadow duration-100 bg-gradient-to-b from-[#BEBEBE] to-[#B1B1B1] shadow-[inset_0_1px_0.75px_0.5px_rgba(222,222,222,0.5),inset_0_0_0_0.5px_rgba(0,0,0,0.25),inset_0_-1px_0.5px_0.75px_rgba(206,206,206,0.15),0_0_0_0_rgba(0,0,0,0.25),0_0_1px_0_rgba(0,0,0,0.25),0_2px_2px_0_rgba(0,0,0,0.22),0_4px_2px_0_rgba(0,0,0,0.13)]  active:shadow-[inset_0px_0px_0px_0.5px_rgba(0,0,0,0.25),inset_-1px_-1px_0.5px_0.75px_rgba(206,206,206,0.25),inset_1px_1px_0.75px_0.5px_rgba(144,144,144,0.75)] active:[&>div]:scale-90",
    },
    size: {
      default: "h-6",
      large: "h-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

const CellComponent = ({
  cell,
  size = "default",
}: {
  cell: Cell;
  size?: "default" | "large";
  children?: React.ReactElement;
}) => {
  const minesweeper = useMinesweep();

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    cell.flag();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    minesweeper.handleCellClick(cell);
  };

  if (cell.isRevealed && !cell.isMine) {
    return <NumberCell numAdjacentMines={cell.numAdjacentMines} />;
  }

  if (cell.isRevealed && cell.isMine) {
    return <MineCell triggerMine={cell.gameOverBG} />;
  }

  return (
    <Button
      id={`cell-${cell.row}${cell.column}`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      size={size}
      variant="default"
    >
      {cell.isFlagged ? (
        <div className="h-full w-full flex items-center justify-center">
          <img className="mt-[2px] h-4 w-4" src={"flag.png"} />
        </div>
      ) : null}
    </Button>
  );
};

type CellNumberColours = {
  [key: string]: string;
};

const adjacentCellNumberColours: CellNumberColours = {
  0: "text-transparent",
  1: "text-blue-700",
  2: "text-green-700",
  3: "text-red-600",
  4: "text-blue-900",
  5: "text-red-900",
  6: "text-cyan-700",
  7: "text-black",
  8: "text-gray-500",
};

type RevealedCellProps = {
  triggerMine?: boolean;
};

const RevealedCell: React.FC<PropsWithChildren<RevealedCellProps>> = ({
  children,
  triggerMine = false,
}) => {
  return (
    <div
      arial-label="Revealed Cell"
      className={`flex border-dashed border-[0.5px] ${
        triggerMine ? "bg-red-600" : null
      } border-gray-400 h-6 select-none aspect-square items-center  justify-center text-center font-extrabold`}
    >
      {children}
    </div>
  );
};

const MineCell = ({ triggerMine }: RevealedCellProps) => {
  return (
    <RevealedCell triggerMine={triggerMine}>
      <img className="mt-[2px] h-4 w-4" src={"bomb.png"} />
    </RevealedCell>
  );
};

const NumberCell = ({ numAdjacentMines }: { numAdjacentMines: number }) => {
  const style = adjacentCellNumberColours[numAdjacentMines] || "";
  return (
    <RevealedCell>
      {<span className={`${style} pt-[2px]`}>{numAdjacentMines}</span>}
    </RevealedCell>
  );
};

const ObservedCellComponent = observer(CellComponent);

export default App;
