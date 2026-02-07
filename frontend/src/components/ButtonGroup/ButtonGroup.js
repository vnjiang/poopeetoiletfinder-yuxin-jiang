import { FaLocationArrow,FaPenFancy } from 'react-icons/fa';

const ButtonGroup = ({ onShareClick, onLocateClick, canShare = false  }) => {
  return (
    <div
  className="
    absolute
    bottom-7 left-3         
    sm:bottom-8 sm:left-3.5      
    md:bottom-8 md:left-3.5  

    z-[100]
    flex flex-col

    gap-2                   
    sm:gap-2.5                
    md:gap-3                 
  "
>

      {canShare && (
      <button
        type="button"
        onClick={onShareClick}
        title="Share a toilet"
        className="
w-10 h-10
sm:w-11 sm:h-11
md:w-12 md:h-12

          rounded-full
          bg-white
          text-[#2563EB]
          shadow-md
          flex items-center justify-center
          hover:bg-white
          hover:scale-105
          transition
        "
      >
<FaPenFancy className="
  text-base       
  sm:text-md  
  md:text-lg    
" />
      </button>
      )}

      <button
        type="button"
        onClick={onLocateClick}
        title="Go to my location"
        className="
w-10 h-10
sm:w-11 sm:h-11
md:w-12 md:h-12

          rounded-full
          bg-white
          text-[#2563EB]
          shadow-md
          flex items-center justify-center
          hover:bg-white
          hover:scale-105
          transition
        "
      >
        <FaLocationArrow className="
  text-base      
  sm:text-md  
  md:text-lg   
" />
      </button>
    </div>
  );
};

export default ButtonGroup;
