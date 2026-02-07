const IconButton = ({ onClick, children, title }) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="
        inline-flex items-center justify-center
        p-2 rounded-lg
        text-white
        text-[18px] sm:text-[19px] lg:text-[20px]
        transition
        hover:scale-110 hover:bg-white/10
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
      "
    >
      {children}
    </button>
  );
};


export default IconButton;
