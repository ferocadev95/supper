const CategoryRowSkeleton = () => {
    return (
        <div className="flex flex-col gap-5 pt-5 pb-10 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-56 rounded-md bg-gray-200" />
                <div className="h-10 w-28 rounded-full bg-gray-200" />
            </div>
            <div className="flex gap-5 overflow-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="w-[260px] h-80 shrink-0 rounded-2xl bg-gray-200"
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoryRowSkeleton;
