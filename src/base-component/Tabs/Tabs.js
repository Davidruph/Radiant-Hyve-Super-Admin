import { twMerge } from "tailwind-merge";
import { Tab as HeadlessTab, Transition } from "@headlessui/react";
import { Fragment, createContext, useContext } from "react";

const tabContext = createContext({
    selected: false,
});

const listContext = createContext({
    variant: "tabs",
});

function Tab({ children, className, fullWidth = true, ...props }) {
    const list = useContext(listContext);
    return (
        <HeadlessTab as={Fragment}>
            {({ selected }) => (
                <li
                    className={twMerge([
                        "focus-visible:outline-none",
                        fullWidth && "flex-1",
                        list.variant === "tabs" && "-mb-px",
                    ])}
                >
                    <tabContext.Provider
                        value={{
                            selected: selected,
                        }}
                    >
                        {typeof children === "function"
                            ? children({
                                selected: selected,
                            })
                            : children}
                    </tabContext.Provider>
                </li>
            )}
        </HeadlessTab>
    );
}

function TabButton({ children, className, as, ...props }) {
    const tab = useContext(tabContext);
    const list = useContext(listContext);
    const Component = as || "a";

    return (
        <Component
            className={twMerge([
                "cursor-pointer block appearance-none px-5 py-2.5 text-[#9CA3AF] font-normal md:text-base text-sm",
                tab.selected && "text-[#293FE3] border-b-4 border-[#293FE3]",

                // Default
                list.variant === "tabs" &&
                "",
                list.variant === "tabs" &&
                tab.selected &&
                "",
                list.variant === "tabs" &&
                !tab.selected &&
                "",

                // Pills
                list.variant === "pills" && "rounded-md border-0",
                list.variant === "pills" &&
                tab.selected &&
                "bg-primary text-white font-medium",

                // Boxed tabs
                list.variant === "boxed-tabs" &&
                "shadow-[0px_3px_20px_#0000000b] rounded-md",
                list.variant === "boxed-tabs" &&
                tab.selected &&
                "bg-primary text-white font-medium",

                // Link tabs
                list.variant === "link-tabs" &&
                "",
                list.variant === "link-tabs" &&
                tab.selected &&
                "",

                className,
            ])}
            {...props}
        >
            {children}
        </Component>
    );
}

Tab.Button = TabButton;


Tab.Group = ({ children, ...props }) => {
    return (
        <HeadlessTab.Group as="div" {...props}>
            {children}
        </HeadlessTab.Group>
    );
};

Tab.List = ({ children, className, variant = "tabs", ...props }) => {
    return (
        <listContext.Provider
            value={{
                variant: variant,
            }}
        >
            <HeadlessTab.List
                as="ul"
                className={twMerge([
                    variant === "tabs" && "",
                    "w-full flex",
                    className,
                ])}
                {...props}
            >
                {children}
            </HeadlessTab.List>
        </listContext.Provider>
    );
};

Tab.Panels = ({ children, className, ...props }) => {
    return (
        <HeadlessTab.Panels as="div" className={className} {...props}>
            {children}
        </HeadlessTab.Panels>
    );
};

Tab.Panel = ({ children, className, ...props }) => {
    return (
        <HeadlessTab.Panel as={Fragment}>
            {({ selected }) => (
                <Transition
                    appear
                    as="div"
                    show={selected}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className={className}
                    {...props}
                >
                    <>
                        {typeof children === "function"
                            ? children({
                                selected: selected,
                            })
                            : children}
                    </>
                </Transition>
            )}
        </HeadlessTab.Panel>
    );
};

export default Tab;
