import React from 'react';
import { Calendar, Clock, MapPin, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { generateGoogleCalendarUrl, hasSignificantDuration } from '../services/calendarService';
import LoadingSpinner from './LoadingSpinner';

const Schedule: React.FC = () => {
  const { events, loading, error, refetch, lastUpdated } = useCalendarEvents();

  return (
    <section className="py-32 bg-gradient-to-b from-cyan-950/60  via-black/90 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            PROGRAMAÇÃO
          </h2>
          <p className="text-xl text-emerald-100/80 font-light">
            Confira os próximos encontros e eventos do Hope Carmo
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Botão de atualizar e status */}
          <div className="flex justify-between items-center mb-6">
            {lastUpdated && (
              <p className="text-emerald-100/60 text-sm">
                Última atualização: {lastUpdated.toLocaleString('pt-BR')}
              </p>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full font-semibold transition-colors flex items-center border border-emerald-400/30 hover:border-emerald-400/50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {/* Estado de loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-emerald-100/80 text-lg">Carregando eventos...</p>
            </div>
          )}

          {/* Estado de erro */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
              <p className="text-red-300 text-lg mb-4">Erro ao carregar eventos</p>
              <p className="text-emerald-100/60 text-center max-w-md">{error}</p>
              <button
                onClick={refetch}
                className="mt-6 bg-emerald-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-emerald-300 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Lista de eventos */}
          {!loading && !error && (
            <div className="space-y-6">
              {events.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-emerald-100/80 text-lg">Nenhum evento encontrado</p>
                  <p className="text-emerald-100/60 mt-2">Verifique o calendário ou tente novamente mais tarde</p>
                </div>
              ) : (
                events.map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    className="group bg-black/20 hover:bg-emerald-400/10 rounded-2xl p-8 transition-all duration-300 cursor-pointer border border-emerald-400/20 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-400/20"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            event.type === 'Evento Especial' 
                              ? 'bg-yellow-600 text-white shadow-lg' 
                              : event.type === 'Reunião'
                              ? 'bg-yellow-600 text-white shadow-lg'
                              : 'bg-emerald-400/20 text-emerald-300'
                          }`}>
                            {event.type}
                          </span>
                          {event.isRecurring && (
                            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                              Recorrente
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                          {event.title}
                        </h3>
                        
                        <p className="text-emerald-100/70 mb-6 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-emerald-200/80">
                            <Calendar className="h-4 w-4 mr-2" />
                            {(() => {
                              const startDate = new Date(event.date);
                              const endDate = event.endDate;
                              const isSameDay = startDate.toDateString() === endDate.toDateString();
                              
                              // Para eventos recorrentes, sempre mostrar apenas 1 dia
                              if (event.isRecurring) {
                                return startDate.toLocaleDateString('pt-BR');
                              }
                              
                              // Para eventos únicos, mostrar período se for diferente
                              if (isSameDay) {
                                return startDate.toLocaleDateString('pt-BR');
                              } else {
                                return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
                              }
                            })()}
                          </div>
                          <div className="flex items-center text-emerald-200/80">
                            <Clock className="h-4 w-4 mr-2" />
                            {(() => {
                              // Para eventos recorrentes, sempre mostrar apenas o horário de início
                              if (event.isRecurring) {
                                return event.time;
                              }
                              
                              // Para eventos únicos, mostrar período se tiver duração significativa
                              if (hasSignificantDuration(event)) {
                                return `${event.time} - ${event.endDate.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })}`;
                              } else {
                                return event.time;
                              }
                            })()}
                          </div>
                          <div className="flex items-center text-emerald-200/80">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location.replace(/\\/g, '')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 lg:mt-0 lg:ml-8">
                        <button 
                          onClick={() => {
                            const googleCalendarUrl = generateGoogleCalendarUrl(event);
                            if (googleCalendarUrl) {
                              window.open(googleCalendarUrl, '_blank');
                            }
                          }}
                          title="Adicionar ao meu calendário"
                          className="bg-emerald-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-emerald-300 transition-colors flex items-center shadow-lg hover:shadow-emerald-400/30 group"
                        >
                          <span className="group-hover:scale-105 transition-transform">Participar</span>
                          <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Schedule;