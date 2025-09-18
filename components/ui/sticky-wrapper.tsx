

type Props = {
    children: React.ReactNode;
}

export const StickyWrapper = ({children}: Props) => {
    return (
        <div className="lg:block w-[250px] lg:w-[400px] sticky self-end bottom-6">
           <div className="h-[500px] lg:h-[373px]  sticky top-6 flex flex-col">
             {children}
           </div>
        </div>
    )
}