import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalTitle,
  ModalTrigger,
} from "./Modal";
import * as styles from "./modal.css";

const meta = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    // The modal renders in a portal on <body>, outside the story root,
    // so point the accessibility checks at the whole document.
    a11y: { context: "body" },
  },
  args: {
    onOpenChange: fn(),
  },
  argTypes: {
    open: { control: false },
    initialOpen: { control: "boolean" },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/** A destructive confirmation. Focus starts on Cancel, the safe choice. */
export const Default: Story = {
  render: (args) => {
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    return (
      <Modal {...args}>
        <ModalTrigger>Delete file</ModalTrigger>

        <ModalContent initialFocus={cancelRef}>
          <ModalClose aria-label="Close" className={styles.closeIconButton}>
            <span aria-hidden="true">×</span>
          </ModalClose>

          <ModalTitle>Delete “report.pdf”?</ModalTitle>
          <ModalDescription>This permanently removes the file. You can’t undo this.</ModalDescription>

          <ModalFooter>
            <ModalClose ref={cancelRef}>Cancel</ModalClose>
            <ModalClose className={styles.dangerButton}>Delete</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
};

/** Starts open, for reviewing the open state without clicking. */
export const InitiallyOpen: Story = {
  ...Default,
  args: { initialOpen: true },
};

/** The parent owns the open state, e.g. to close after a form submits. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("report.pdf");

    const handleOpenChange = (next: boolean) => {
      setOpen(next);
      args.onOpenChange?.(next);
    };

    return (
      <div>
        <p>Parent state: {open ? "open" : "closed"}</p>

        <Modal open={open} onOpenChange={handleOpenChange}>
          <ModalTrigger>Rename file</ModalTrigger>

          <ModalContent>
            <ModalTitle>Rename file</ModalTitle>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleOpenChange(false);
              }}
            >
              <label htmlFor="file-name">File name</label>{" "}
              <input id="file-name" value={name} onChange={(e) => setName(e.target.value)} />

              <ModalFooter>
                <ModalClose>Cancel</ModalClose>
                <button type="submit" className={styles.button}>
                  Save
                </button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>
    );
  },
};

/** Content taller than the viewport scrolls inside the dialog. */
export const LongContent: Story = {
  args: { initialOpen: true },
  render: (args) => (
    <Modal {...args}>
      <ModalTrigger>Read terms</ModalTrigger>

      <ModalContent>
        <ModalTitle>Terms of service</ModalTitle>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i}>
            Section {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
        <ModalFooter>
          <ModalClose>Close</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

/* -------------------------------------------------------------------------- */
/* Interaction test                                                           */
/* -------------------------------------------------------------------------- */

/** Checks keyboard use, focus management and ARIA wiring. */
export const KeyboardInteraction: Story = {
  ...Default,
  play: async ({ args, canvas, canvasElement, userEvent, step }) => {
    // The dialog is portaled to <body>, so query the whole document for it.
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Delete file" });

    await step("Open with the keyboard", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
    });

    const dialog = await page.findByRole("dialog", { name: "Delete “report.pdf”?" });

    await step("Dialog is labelled and modal", async () => {
      await expect(dialog).toHaveAttribute("aria-modal", "true");
      await expect(dialog).toHaveAccessibleDescription(
        "This permanently removes the file. You can’t undo this."
      );
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    await step("Focus starts on Cancel", async () => {
      await waitFor(() => expect(page.getByRole("button", { name: "Cancel" })).toHaveFocus());
    });

    await step("Tab wraps around inside the dialog", async () => {
      await userEvent.tab();
      await waitFor(() => expect(page.getByRole("button", { name: "Delete" })).toHaveFocus());
      await userEvent.tab();
      await waitFor(() => expect(page.getByRole("button", { name: "Close" })).toHaveFocus());
    });

    await step("Escape closes and returns focus to the trigger", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
      await expect(trigger).toHaveFocus();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    });

    await step("Clicking the backdrop closes the modal", async () => {
      await userEvent.click(trigger);
      const reopened = await page.findByRole("dialog");
      const backdrop = reopened.closest<HTMLElement>(`.${styles.overlay}`);
      await expect(backdrop).not.toBeNull();

      await userEvent.click(backdrop!);
      await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
      await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
      // Note: user-event's simulated click doesn't reproduce the browser blur that
      // the backdrop's onMouseDown guards against, so focus return after a real
      // mouse click is verified manually rather than here.
    });
  },
};
