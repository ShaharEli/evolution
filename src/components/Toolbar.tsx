import { Creature } from "classes";

interface IProps {
  setCreatures: (cs: Creature[]) => void;
  setBestScore: (num: number) => void;
  setGeneration: (num: number) => void;
  raysOn: boolean;
  setRaysOn: React.Dispatch<React.SetStateAction<boolean>>;
  creatures: Creature[];
}
const Toolbar = ({
  setCreatures,
  setBestScore,
  setGeneration,
  raysOn,
  setRaysOn,
  creatures,
}: IProps) => {
  return (
    <div className="flex mx-auto gap-2 w-full p-2 justify-center">
      <div
        className="p-2 bg-slate-200 hover:bg-slate-400 cursor-pointer "
        onClick={() => {
          localStorage.removeItem("prevData");
          window.location.reload();
        }}
      >
        reset
      </div>
      <div
        className="p-2 bg-slate-200 hover:bg-slate-400 cursor-pointer "
        onClick={() => {
          creatures.forEach((creature) => creature.toggleRaysShown());
          setRaysOn((r: boolean) => !r);
        }}
      >
        Turn rays {raysOn ? " off" : " on"}
      </div>
    </div>
  );
};

export default Toolbar;
