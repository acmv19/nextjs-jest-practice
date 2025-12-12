"use client";

import { ReactNode } from "react";

type buttonProps = {
  onClick: () => void;
  children: ReactNode;
};

export default function Button({
  onClick,
  children,
}: buttonProps): JSX.Element {
  return <button onClick={onClick}>{children}</button>;
}
