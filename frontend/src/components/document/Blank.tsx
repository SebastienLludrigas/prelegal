export function Blank({
  value,
  placeholder,
}: {
  value: string;
  placeholder: string;
}) {
  const filled = value.trim().length > 0;
  return (
    <span className={filled ? "mnda-blank" : "mnda-blank mnda-blank--empty"}>
      {filled ? value : placeholder}
    </span>
  );
}
