import React, { createContext, useContext, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";

const dialogContext = createContext({
    open: false,
    zoom: false,
    size: "md",
});

function Dialog({
    children,
    className,
    as = "div",
    open = false,
    onClose,
    staticBackdrop,
    size = "md",
    ...props
}) {
    const focusElement = useRef(null);
    const [zoom, setZoom] = useState(false);

    return (
        <dialogContext.Provider
            value={{
                open: open,
                zoom: zoom,
                size: size,
            }}
        >
            <Transition appear show={open}>
                <HeadlessDialog
                    as={as}
                    onClose={(value) => {
                        if (!staticBackdrop) {
                            return onClose(value);
                        } else {
                            setZoom(true);
                            setTimeout(() => {
                                setZoom(false);
                            }, 300);
                        }
                    }}
                    initialFocus={focusElement}
                    className={twMerge([
                        "fixed inset-0 z-[11] flex items-center justify-center",
                        className,
                    ])}
                    {...props}
                >
                    {children}
                </HeadlessDialog>
            </Transition>
        </dialogContext.Provider>
    );
}

function DialogPanel({
    children,
    className,
    as = "div",
    ...props
}) {
    const dialog = useContext(dialogContext);
    return (
        <>
            <Transition.Child
                as="div"
                enter="ease-in-out duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-[400ms]"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="fixed inset-0 bg-black/60"
                aria-hidden="true"
            />
            <Transition.Child
                as="div"
                enter="ease-in-out duration-500"
                enterFrom="opacity-0 -translate-y-10"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in-out duration-[400ms]"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-10"
                className="fixed inset-0 flex items-center justify-center sm:px-0 px-2"
            >
                <HeadlessDialog.Panel
                    as={as}
                    className={twMerge([
                        "bg-white relative rounded-xl shadow-md sm:mx-8 mx-2 transition-transform dark:bg-darkmode-600",
                        dialog.size === "xs" && "sm:w-[300px]",
                        dialog.size === "sm" && "sm:w-[460px]",
                        dialog.size === "md" && "lg:w-[530px] md:w-[400px]",
                        dialog.size === "lg" && "md:w-[600px] w-full",
                        dialog.size === "xl" && "sm:w-[600px] lg:w-[900px] ",
                        dialog.size === "xxl" && "sm:w-[800px] lg:w-[1200px] ",
                        dialog.zoom && "scale-105",
                        className,
                    ])}
                    {...props}
                >
                    {children}
                </HeadlessDialog.Panel>
            </Transition.Child>
        </>
    );
}

const DialogTitle = ({
    children,
    className,
    as = "div",
    ...props
}) => {
    return (
        <HeadlessDialog.Title
            as={as}
            className={twMerge([
                "flex items-center px-5 py-3 border-b border-slate-200/60 dark:border-darkmode-400",
                className,
            ])}
            {...props}
        >
            {children}
        </HeadlessDialog.Title>
    );
};

const DialogDescription = ({
    children,
    className,
    as = "div",
    ...props
}) => {
    return (
        <HeadlessDialog.Description
            as={as}
            className={twMerge(["p-0", className])}
            {...props}
        >
            {children}
        </HeadlessDialog.Description>
    );
};

const DialogFooter = ({ as: C = "div", children, className, ...props }) => {
    return (
        <C
            className={twMerge([
                "px-5 py-3 text-right border-t border-slate-200/60 dark:border-darkmode-400",
                className,
            ])}
            {...props}
        >
            {children}
        </C>
    );
};

Dialog.Panel = DialogPanel;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Footer = DialogFooter;

export default Dialog;
