type Props = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

/** Consistent section shell — max width, rhythm, scroll anchor offset. */
export default function Section({ id, children, className = "" }: Props) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 px-6 py-28 md:py-40 ${className}`}
    >
      <div className="mx-auto w-full max-w-[1120px]">{children}</div>
    </section>
  );
}
