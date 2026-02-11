import {
  CalcButton,
  CalcCheckChip,
  CalcInput,
  CalcInputAdd,
} from "@/components/ui/calc-ui";

function FakeInput() {
  return (
    <div className="w-full py-[1.2rem] opacity-0">
      <div className="flex w-full flex-wrap items-center gap-2 px-3">
        <CalcInputAdd className="min-w-[100px] flex-[999_1_100px]" />
        <CalcInput className="min-w-0 flex-[1_1_84px]" />
        <CalcInput className="min-w-0 flex-[1_1_84px]" />
        <CalcInput className="min-w-0 flex-[1_1_84px]" />
        <CalcCheckChip>
          <input className="mr-1 size-5 rounded-full accent-muted-foreground" />
          Ex
        </CalcCheckChip>
        <CalcCheckChip>
          <input className="mr-1 size-5 rounded-full accent-muted-foreground" />
          TD
        </CalcCheckChip>
        <CalcButton variant="primary" className="ml-auto cursor-pointer rounded-full">
          +
        </CalcButton>
      </div>
    </div>
  );
}

export default FakeInput;
