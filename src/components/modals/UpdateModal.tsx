import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const UpdateModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal title="Update Message October 2025" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        We've finished the five letter words again and have switched back to six letter words.  The random words are seven letters - I'm not sure about this list, it seems a bit too tricky but I might swap them into the main list once the six letter words are done once more. 
      </p>

<br></br>
        <h3>Update Message July 2024</h3>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        This is advance notice that we are coming to the end of the six letter word list.  After a bit of thought I have over-hauled the five letter word list and this app will be switching to five letters for the word of the day and six letters for the random word on Tuesday.  
      </p>
     
      <br></br>
        <h3>Update Message March 2024</h3>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        I have received a DMCA takedown message from the New York Times, via github, for the Git repository on which this is based.  I've made some changes (e.g., to the location of the Keyboard) based on the details in the letter but whether this will convince them is anyone's guess.  If this suddenly vanishes you will know why.
      </p>
      <br></br>
        <h3>Update Message April 2023</h3>
       <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        As many of you have noticed, Doctor Whordle has switched from 5-letter to 6-letter words.  This is basically because it had worked through my list of 5 letter words.  The new 6-letter word list should last 
        until around May/June next year.  Then I'll need to think of something else.
      </p>
      <br></br>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        My apologies for the way this was sprung on many of you.  Foolishly, I had assumed it would be obvious what had happened but, in retrospect, I should have given some advance warning.  It didn't 
        help that my database of regular 6-letter words wasn't as extensive as would have been ideal (hopefully it is better now) and there are some bugs with the new "Random Word" mode that I'm working on.
      </p>
      <br></br>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        Speaking of which, the Random Word mode uses the old 5-letter word list.  It won't track stats like the 6-letter Word of the Day, but each time you complete a 5-letter whordle you should be 
        able to instantly generate another.  This is new functionality so there may be some bugs I've not noticed yet.
        </p>
        <br></br>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        Please feel free to contact me about any issues: louise@dennis-sellers.com, purplecat on DreamWidth, @louiseadennis on Twitter and Mastodon.
        </p>
        <br></br>
        <p className="text-sm text-gray-500 dark:text-gray-300 text-left">
        To see this message again click on the exclamation icon on the left of the navigation bar.
        </p>
    </BaseModal>
  )
}
