function FakeInput() {
  return (
    <div className="w-full py-[1.2rem] opacity-0">
      <div className="flex w-full flex-wrap items-center gap-2 px-3">
        <input className="calc-input-add min-w-[100px] flex-[999_1_100px]" />
        <input className="calc-input min-w-0 flex-[1_1_84px]" />
        <input className="calc-input min-w-0 flex-[1_1_84px]" />
        <input className="calc-input min-w-0 flex-[1_1_84px]" />
        <label className="flex min-h-11 items-center gap-2 rounded-lg bg-[#2b2c32] px-4 text-sm text-zinc-300">
          <input className="size-5 mr-1 accent-zinc-500 rounded-full" />
          Ex
        </label>
        <label className="flex items-center gap-2 rounded-lg bg-[#2b2c32] px-4 text-sm text-zinc-300 min-h-11">
          <input className="size-5 mr-1 accent-zinc-500 rounded-full" />
          TD
        </label>
        <button className="calc-btn calc-btn--primary ml-auto cursor-pointer rounded-full">
          +
        </button>
      </div>
    </div>
  );
}

export default FakeInput;
