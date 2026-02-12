import {
  CalcButton,
  CalcCheckChip,
  CalcInput,
  CalcInputAdd,
} from "@/components/ui/calc-ui";

function FakeInput({ opacity = 0 }) {
  return (
    <div className={`w-full py-[1.2rem] opacity-${opacity}`}>
      <div className="flex w-full flex-wrap items-center gap-2 px-3">
        <CalcInputAdd
          placeholder="Module"
          className="min-w-[100px] flex-[999_1_100px]"
        />
        <CalcInput
         placeholder="Coef"
         className="min-w-0 flex-[1_1_84px]" />
        <CalcInput
          placeholder="TD"
         className="min-w-0 flex-[1_1_84px]" />
        <CalcInput 
          placeholder="Exam"
        className="min-w-0 flex-[1_1_84px]" />
        <CalcCheckChip>
          <input type="checkbox" checked className="mr-1 size-5 rounded-full accent-muted-foreground" />
          Ex
        </CalcCheckChip>
        <CalcCheckChip>
          <input type="checkbox" checked className="mr-1 size-5 rounded-full accent-muted-foreground" />
          TD
        </CalcCheckChip>
        <CalcButton
          variant="primary"
          className="ml-auto cursor-pointer"
        >
          +
        </CalcButton>
      </div>
    </div>
  );
}

export default FakeInput;
