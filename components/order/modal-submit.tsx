"use client";

import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  modalId: string;
};

/** Closes the DaisyUI checkbox modal, then performs a normal form submit. */
export default function ModalSubmit({ modalId, onClick, ...rest }: Props) {
  return (
    <button
      type="submit"
      {...rest}
      onClick={(e) => {
        const box = document.getElementById(modalId) as HTMLInputElement | null;
        if (box) box.checked = false; // close modal immediately
        onClick?.(e);                 // allow any additional handler
      }}
    />
  );
}
