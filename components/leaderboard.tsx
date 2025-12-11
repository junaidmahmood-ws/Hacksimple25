import React, { useState, useEffect } from 'react';

import { 

  Trophy, 

  Medal, 

  Calendar, 

  ChevronLeft, 

  ChevronRight, 

  TrendingUp, 

  TrendingDown, 

  Minus,

  Crown,

  Snowflake,

  Gift,

  Users,

  Search,

  Filter

} from 'lucide-react';

import { LeaderboardUser, LeaderboardViewMode, DailyPrize } from '../types';

import { MiniSantaHat } from './ChristmasDecorations';

import Prizes from './Prizes';

import { fetchLeaderboardUsers, getCurrentUserRank as getCurrentUserRankFromSupabase } from '../services/leaderboardService';

// Exported helper to fetch the current user's rank for a given category
export const getCurrentUserRank = async (category: string = 'General') => {
  return await getCurrentUserRankFromSupabase(category);
};



const CATEGORIES = ['Students', 'General', 'Advanced'] as const;

type Category = typeof CATEGORIES[number];



const dates = ['2023-12-08', '2023-12-09', '2023-12-10'];



const Leaderboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {

  const [showPrizes, setShowPrizes] = useState(false);

  const [viewMode, setViewMode] = useState<LeaderboardViewMode>('OVERALL');

  const [category, setCategory] = useState<Category>('General');

  const [dateIndex, setDateIndex] = useState(dates.length - 1);

  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  const [loading, setLoading] = useState(true);

  const [totalCount, setTotalCount] = useState(0);



  const currentDate = dates[dateIndex];



  useEffect(() => {

    // Fetch users from Supabase

    const loadUsers = async () => {

      setLoading(true);

      try {

        // Fetch users from Supabase, filtered by category

        const fetchedUsers = await fetchLeaderboardUsers(category);

        

        // Sort by percentUp (already sorted by Supabase, but ensure it)

        fetchedUsers.sort((a, b) => b.percentUp - a.percentUp);

        

        // Assign ranks (should already be assigned, but ensure it)

        const rankedUsers = fetchedUsers.map((user, index) => ({

          ...user,

          rank: index + 1

        }));



        setUsers(rankedUsers);

        setTotalCount(rankedUsers.length);

      } catch (error) {

        console.error('Error loading leaderboard users:', error);

        setUsers([]);

        setTotalCount(0);

      } finally {

        setLoading(false);

      }

    };



    loadUsers();

  }, [category, viewMode, dateIndex]); 



  // Find current user in the *entire* list if they aren't in the current view? 

  // Or just find them in the current list. For sticky footer, usually want them visible if they are in this category.

  // If we want to show "Your Ranking" regardless of category, we'd look in ALL_USERS.

  // But typically leaderboard footers show your rank *in this context*.

  // Let's grab the current user if they exist in the currently displayed list.

  const currentUser = users.find(u => u.isCurrentUser);

  // Alternatively, if current user is in another category, we might want to know that?

  // For this demo, let's just use the filtered list's current user.



  const handlePrevDate = () => {

    if (dateIndex > 0) setDateIndex(prev => prev - 1);

  };



  const handleNextDate = () => {

    if (dateIndex < dates.length - 1) setDateIndex(prev => prev + 1);

  };



  const formatDate = (dateStr: string) => {

    const date = new Date(dateStr);

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  };



  if (showPrizes) {

    return <Prizes onBack={() => setShowPrizes(false)} />;

  }



  return (

    <div className=" rounded-[32px] overflow-hidden flex flex-col min-h-full w-full relative ">

       <style>{`

          @keyframes fadeInUp {

            from { opacity: 0; transform: translateY(10px); }

            to { opacity: 1; transform: translateY(0); }

          }

          @keyframes slideDown {

            from { opacity: 0; transform: translateY(-10px); }

            to { opacity: 1; transform: translateY(0); }

          }

          @keyframes countUpdate {

            from { opacity: 0; transform: translateY(-4px) scale(0.95); }

            to { opacity: 1; transform: translateY(0) scale(1); }

          }

          .animate-fade-in-up {

            animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;

          }

          .animate-slide-down {

            animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;

          }

          .animate-count-update {

            animation: countUpdate 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;

          }

       `}</style>

       {/* Background Decoration - Subtler */}

       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">

          <Snowflake className="w-64 h-64 text-gray-400" />

       </div>



      {/* Header Section */}

      <div className="pt-8 px-6 pb-2 relative z-10 flex-shrink-0">

        

        {/* Top Navigation Bar */}

        <div className="flex items-center justify-between mb-8">

          <button 

            onClick={onClose}

            className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm group"

          >

            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />

          </button>

          <div className="flex items-center gap-2">

            {/* User Stats Card in Header - Aligned Right but Left of Toggle */}

            {currentUser && (

               <div className="hidden sm:flex items-center gap-3 bg-white border border-gray-100 rounded-full shadow-sm px-4 py-2 h-[44px]">

                  {/* Rank Circle */}

                  <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-gray-200 text-gray-600">

                     #{currentUser.rank}

                  </span>

                  

                  {/* Avatar & Name */}

                  <div className="flex items-center gap-2">

                     <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-white shadow-sm">

                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />

                     </div>

                     <div className="flex flex-col">

                     <span className="text-sm font-bold text-gray-900 leading-none">{currentUser.name} <span className="text-gray-400 font-normal text-xs">(You)</span></span>

                    <span className="text-[8px] text-gray-400 font-medium mt-0.5">{currentUser.category}</span>

                    </div>

                  </div>



                  {/* Spacer */}

                  <div className="w-px h-6 bg-gray-100 mx-2"></div>



                  {/* Stats */}

                  <div className="flex flex-col items-end">

                     <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg">

                        <TrendingUp className="w-3 h-3 text-green-600" />

                        <span className="text-xs font-bold text-green-700">{currentUser.percentUp}%</span>

                     </div>

                  </div>

               </div>

            )}

            

            <div className="flex bg-[#e6e5e1] p-1 rounded-full">

               <button 

                 onClick={() => setViewMode('OVERALL')}

                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'OVERALL' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}

               >

                 Overall

               </button>

               <button 

                 onClick={() => setViewMode('DAILY')}

                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'DAILY' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}

               >

                 Daily

               </button>

            </div>

            

            {/* Search Button removed from here or maybe kept if needed, but per request focusing on user stats position */}

           

          </div>

        </div>



        {/* Title Area - More like "Wallet" or "Invest" headers */}

        <div className="mb-8">

            <h2 className="text-4xl font-serif font-medium text-gray-900 flex items-center gap-2 mb-2">

              Leaderboard

              {/* Subtle Christmas Touch */}

              <MiniSantaHat className="w-6 h-6 -rotate-12 opacity-80" />

            </h2>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3 text-sm">

                  <span className="flex items-center gap-1.5 text-gray-500 font-medium px-2 py-1 bg-white/50 rounded-lg">

                     <Users className="w-3.5 h-3.5 transition-opacity duration-300" /> 
                     <span className="inline-block min-w-[3ch] text-right">
                       {loading ? (
                         <span className="inline-block opacity-50 transition-opacity duration-300">...</span>
                       ) : (
                         <span 
                           key={totalCount}
                           className="inline-block animate-count-update"
                         >
                           {totalCount.toLocaleString()}
                         </span>
                       )}
                     </span>
                     <span className="transition-opacity duration-300">participants</span>

                  </span>

                  <button 

                    onClick={() => setShowPrizes(true)}

                    className="flex items-center gap-1.5 text-amber-700 font-bold px-3 py-1 bg-white/50 hover:bg-white/80 rounded-lg transition-colors "

                  >

                     <Gift className="w-3.5 h-3.5" /> View Prizes

                  </button>

              </div>

            </div>

        </div>



        {/* Categories - Horizontal Scroll Chips */}

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">

            {CATEGORIES.map((cat) => (

              <button

                key={cat}

                onClick={() => setCategory(cat)}

                className={`

                  px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border

                  ${category === cat 

                    ? 'bg-gray-900 text-white border-gray-900 shadow-md' 

                    : 'bg-white border-transparent text-gray-600 hover:bg-white/80 hover:shadow-sm'

                  }

                `}

              >

                {cat}

              </button>

            ))}

        </div>



        {/* Daily Date Navigation */}

        {viewMode === 'DAILY' && (

          <div className="flex items-center justify-between gap-4 mb-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 animate-slide-down">

            <button 

              onClick={handlePrevDate} 

              disabled={dateIndex === 0}

              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"

            >

              <ChevronLeft className="w-4 h-4 text-gray-600" />

            </button>

            <div className="text-center">

               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Viewing Ranking For</div>

               <div className="font-bold text-gray-900 text-sm flex items-center justify-center gap-2">

                 {formatDate(currentDate)}

                 {dateIndex === dates.length - 1 && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">TODAY</span>}

               </div>

            </div>

            <button 

              onClick={handleNextDate}

              disabled={dateIndex === dates.length - 1}

              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"

            >

              <ChevronRight className="w-4 h-4 text-gray-600" />

            </button>

          </div>

        )}

      </div>



      {/* List Content - Card Style Container */}

      <div className="flex-1 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col relative z-20">

         

         {/* Column Headers */}

         <div className="grid grid-cols-12 px-8 pt-6 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">

            <div className="col-span-1 text-center">#</div>

            <div className="col-span-7 pl-2">Trader</div>

            <div className="col-span-4 text-right">Return</div>

         </div>



         {/* Scrollable List */}

         <div className="px-4 pb-6" key={`${viewMode}-${category}-${dateIndex}`}>

            {loading ? (

                <div className="flex flex-col items-center justify-center py-12 text-gray-400">

                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>

                    <span className="text-xs">Loading rankings...</span>

                </div>

            ) : (

                users.slice(0, 10).map((user, index) => (

                <div 

                    key={user.id}

                    style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}

                    className={`

                    grid grid-cols-12 items-center px-4 py-3.5 mb-1 rounded-2xl transition-all cursor-pointer group animate-fade-in-up

                    ${user.isCurrentUser ? 'bg-gray-50 border border-gray-100' : 'hover:bg-gray-50 border border-transparent hover:border-gray-50'}

                    `}

                >

                    <div className="col-span-1 flex justify-center">

                    <span className={`

                        w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold

                        ${user.rank === 1 ? 'bg-amber-100 text-amber-700' : 

                        user.rank === 2 ? 'bg-gray-200 text-gray-600' : 

                        user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}

                    `}>

                        {user.rank}

                    </span>

                    </div>

                    

                    <div className="col-span-7 flex items-center gap-3 pl-2">

                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden relative border border-white shadow-sm">

                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />

                        {user.rank <= 3 && (

                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent mix-blend-overlay"></div>

                        )}

                    </div>

                    <div className="flex flex-col">

                        <span className={`text-sm font-bold ${user.isCurrentUser ? 'text-gray-900' : 'text-gray-900'}`}>

                        {user.name} {user.isCurrentUser && <span className="text-gray-400 font-normal text-xs">(You)</span>}

                        </span>

                        {user.rank <= 3 && (

                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">

                            Top {user.rank} <Crown className="w-3 h-3" />

                            </span>

                        )}

                    </div>

                    </div>

                    

                    <div className="col-span-4 flex flex-col items-end justify-center">

                    <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg">

                        <TrendingUp className="w-3 h-3 text-green-600" />

                        <span className="text-xs font-bold text-green-700">{user.percentUp}%</span>

                    </div>

                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">+${user.moneyUp.toLocaleString()}</span>

                    </div>

                </div>

                ))

            )}

         </div>

      </div>



      {/* Floating User Stats - "Sticky Bottom Sheet" Style */}

      {currentUser && (

        <div key={currentUser.id} className="absolute bottom-6 left-6 right-6 animate-fade-in-up">

            <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between backdrop-blur-md bg-opacity-95 border border-white/10">

                <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">

                        <span className="font-bold text-sm">#{currentUser.rank}</span>

                    </div>

                    <div>

                        <div className="font-bold text-sm">Your Ranking</div>

                        <div className="text-[10px] text-gray-400 flex items-center gap-1">

                            {currentUser.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-400" /> : <Minus className="w-3 h-3" />}

                            {currentUser.trend === 'up' ? 'Moving up!' : 'Holding steady'}

                        </div>

                    </div>

                </div>

                <div className="text-right">

                    <div className="font-bold text-lg text-green-400">+{currentUser.percentUp}%</div>

                    <div className="text-xs text-gray-400">+${currentUser.moneyUp.toLocaleString()}</div>

                </div>

            </div>

        </div>

      )}

    </div>

  );

};



export default Leaderboard;

