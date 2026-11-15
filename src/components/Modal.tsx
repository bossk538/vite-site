import * as React from "react";
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import * as styles from "./modal.css";

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

interface ModalOptions {
  /** Starting state when uncontrolled. */
  initialOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called whenever the modal wants to open or close. */
  onOpenChange?: (open: boolean) => void;
}

function useModal({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ModalOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState<string>();
  const [descriptionId, setDescriptionId] = React.useState<string>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const floating = useFloating({ open, onOpenChange: setOpen });
  const { context } = floating;

  const click = useClick(context);
  // Escape key and clicks on the backdrop close the modal.
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  // Adds role="dialog" to the content and aria-haspopup/aria-expanded/aria-controls to the trigger.
  const role = useRole(context, { role: "dialog" });
  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...floating,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, floating, labelId, descriptionId]
  );
}

type ModalContextValue = ReturnType<typeof useModal>;

const ModalContext = React.createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = React.useContext(ModalContext);
  if (context == null) {
    throw new Error("Modal components must be wrapped in <Modal />.");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

export function Modal({
  children,
  ...options
}: React.PropsWithChildren<ModalOptions>) {
  const modal = useModal(options);
  return <ModalContext.Provider value={modal}>{children}</ModalContext.Provider>;
}

export const ModalTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function ModalTrigger({ className, children, ...props }, propRef) {
  const context = useModalContext();
  const ref = useMergeRefs([context.refs.setReference, propRef]);

  return (
    <button
      ref={ref}
      type="button"
      className={cx(styles.button, className)}
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Element to focus when the modal opens. Defaults to the first focusable
   * element. For destructive actions, pass a ref to the safe choice (Cancel).
   */
  initialFocus?: number | React.RefObject<HTMLElement | null>;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ className, children, initialFocus, ...props }, propRef) {
    const { context: floatingContext, ...context } = useModalContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
      <FloatingPortal>
        <FloatingOverlay className={styles.overlay} lockScroll>
          {/* modal: traps focus, hides outside content from screen readers,
              and returns focus to the trigger on close. */}
          <FloatingFocusManager context={floatingContext} modal initialFocus={initialFocus}>
            <div
              ref={ref}
              className={cx(styles.content, className)}
              aria-modal="true"
              aria-labelledby={context.labelId}
              aria-describedby={context.descriptionId}
              {...context.getFloatingProps(props)}
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      </FloatingPortal>
    );
  }
);

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function ModalTitle({ className, children, ...props }, ref) {
  const { setLabelId } = useModalContext();
  const id = useId();

  // Register this heading as the dialog's accessible name.
  React.useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <h2 {...props} ref={ref} id={id} className={cx(styles.title, className)}>
      {children}
    </h2>
  );
});

export const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function ModalDescription({ className, children, ...props }, ref) {
  const { setDescriptionId } = useModalContext();
  const id = useId();

  // Register this text as the dialog's accessible description.
  React.useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return (
    <p {...props} ref={ref} id={id} className={cx(styles.description, className)}>
      {children}
    </p>
  );
});

export const ModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function ModalClose({ className, onClick, ...props }, ref) {
  const { setOpen } = useModalContext();

  return (
    <button
      type="button"
      {...props}
      ref={ref}
      className={cx(styles.button, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
});

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx(styles.footer, className)} />;
}

