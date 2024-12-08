"use client"
import axios from "axios"
import React, { useEffect, useState, useRef } from "react"
import Popup2 from "../../components/Popup"
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
import SideAppbar from "../../components/SideAppbar"
import ChallengeByPopup from "../../components/ChallengeByPopup" 
import DashAppbar from "../../components/DashAppbar"

export default function Basic() {
  const [isModalOpen, setIsModalOpen] = useState(true)
  const modalRef = useRef(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popUpOpen, setPopUpOpen] = useState(false)
  const [data, setData] = useState([])

  // const { data: session, status } = useSession();
  // const router = useRouter();

  // const [Opponent ,setOpponent] =useState("");
  const [noofChallengesSent] = useState("0")

  const [noofChallengesGot, setnoofChallengesGot] = useState("0")

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false)
      }
    }

    // Add event listener to detect clicks
    document.addEventListener("mousedown", handleClickOutside)

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [modalRef])

  function getCookieValue(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
    if (match) return match[2]
    return null
  }

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const userDetailsCookie = getCookieValue("userDetails")

        if (userDetailsCookie) {
          const decodedUserDetails = decodeURIComponent(userDetailsCookie)
          const parsedUserDetails = JSON.parse(decodedUserDetails)

          const response = await axios.get("/api/game/showChallengeBy", {
            params: {
              categoryChosen: "beginner",
              id: parsedUserDetails.id,
              username: parsedUserDetails.username
            }
          })

          if (response.status === 200 && response.data.data) {
            setData(response.data.data)
            setnoofChallengesGot(response.data.data.length)

            // Check if the popup has already been shown and when
            const lastPopupTime = localStorage.getItem("lastPopupTime")
            const currentTime = Date.now()

            // If it has never been shown, or more than 30 minutes have passed, show the popup
            if (
              !lastPopupTime ||
              currentTime - Number(lastPopupTime) > 30 * 60 * 1000
            ) {
              setShowPopup(true)
              localStorage.setItem("lastPopupTime", currentTime.toString()) // Update the last shown time
            }
          }
        }
      } catch (error) {
        console.error("Error fetching challenge data:", error)
        alert("Something went wrong. Please try again.")
      }
    }

    fetchChallengeData()
  }, [])

  return (
    <div className="bg-black min-h-screen text-white "> 
      <DashAppbar/>
      <SideAppbar
        onClickTo={() => {}}
        noofChallengesGot={noofChallengesGot}
        noofChallengesSent={noofChallengesSent}
        onClickBy={() => setPopUpOpen(true)}
      />
      <div className="md:p-10 lg:ml-60 md:ml-56 sm:ml-60 w-5/6 lg:p-20 p-5 mt-14 lg:mt-0 md-mt-0">
        <div className="mt-12 ml-4 text-4xl font-sans font-bold text-white">
          Select Your Opponent:
        </div>
        <div className="border-2 mt-4 ml-4 border-gray-300 rounded-lg text-center">
          <div className="grid grid-cols-4 p-2 bg-indigo-900 items-center rounded-lg">
            <div className="text-sm text-white font-semibold lg:text-lg">
              Rank
            </div>
            <div className="text-sm text-white font-semibold lg:text-lg">
              Name
            </div>
            <div className="text-sm text-white font-semibold lg:text-lg">
              AverageRoc
            </div>
            <div className="text-sm text-white font-semibold lg:text-lg">
              WinRate
            </div>
          </div>
        </div>
      </div>
      <Popup2 />
      {showPopup && (
        <ChallengeByPopup
          onClick={() => {
            setShowPopup(false) // Close the popup when clicked
          }}
          data={data}
        />
      )}

      {/* Render manual popup when popUpOpen is true */}
      {popUpOpen && (
        <ChallengeByPopup
          // Close the manual popup
          onClick={() => setPopUpOpen(false)}
          data={data}
        />
      )}
    </div>
  )
}