import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getQueuePackages, getQueuePackage, reorderPackages, reorderPackageTrips, moveTripUp, moveTripDown, addTripToPackage, removeTripFromPackage, autoGroupPackages, getTrips } from '../../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function OrganizerQueueManagement() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTripId, setNewTripId] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data } = await getQueuePackages();
      setPackages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPackage = async (pkg) => {
    setSelected(pkg);
    try {
      const { data } = await getQueuePackage(pkg.id);
      setTrips(data.trips || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handlePackageMove = async (pkg, dir) => {
    const idx = packages.findIndex(p => p.id === pkg.id);
    if (idx < 0) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= packages.length) return;
    const reordered = [...packages];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(newIdx, 0, moved);
    try {
      await reorderPackages(reordered.map(p => p.id));
      await fetchPackages();
    } catch (e) { console.error(e); }
  };

  const onDragEndPackages = async (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dest = result.destination.index;
    if (src === dest) return;
    const reordered = Array.from(packages);
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dest, 0, moved);
    try {
      await reorderPackages(reordered.map(p => p.id));
      await fetchPackages();
    } catch (e) { console.error(e); }
  };

  const handleTripMove = async (tripId, dir) => {
    if (!selected) return;
    try {
      if (dir === 'up') await moveTripUp(selected.id, tripId);
      else await moveTripDown(selected.id, tripId);
      const { data } = await getQueuePackage(selected.id);
      setTrips(data.trips || []);
    } catch (e) { console.error(e); }
  };

  const onDragEndTrips = async (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dest = result.destination.index;
    if (src === dest) return;
    const reordered = Array.from(trips);
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dest, 0, moved);
    // update positions locally
    const orderedIds = reordered.map(t => t.tripId);
    try {
      await reorderPackageTrips(selected.id, orderedIds);
      const { data } = await getQueuePackage(selected.id);
      setTrips(data.trips || []);
    } catch (e) { console.error(e); }
  };

  const handleAddTrip = async () => {
    if (!selected || !newTripId) return;
    try {
      await addTripToPackage(selected.id, newTripId);
      const { data } = await getQueuePackage(selected.id);
      setTrips(data.trips || []);
      setNewTripId('');
    } catch (e) { console.error(e); }
  };

  const handleRemoveTrip = async (tripId) => {
    if (!selected) return;
    try {
      await removeTripFromPackage(selected.id, tripId);
      const { data } = await getQueuePackage(selected.id);
      setTrips(data.trips || []);
    } catch (e) { console.error(e); }
  };

  const handleAutoGroup = async () => {
    const date = new Date().toISOString().slice(0,10);
    try {
      await autoGroupPackages(date);
      await fetchPackages();
    } catch (e) { console.error(e); }
  };

  return (
    <DragDropContext onDragEnd={(res) => { if (res.type === 'packages') onDragEndPackages(res); else if (res.type === 'trips') onDragEndTrips(res); }}>
    <div className="content-wrapper py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">{t('organizer.queue.title', 'Queue Packages')}</h1>
        <div>
          <button className="outline-button mr-2" onClick={handleAutoGroup}>{t('organizer.queue.autoGroup', 'Auto-group Today')}</button>
          <button className="primary-button" onClick={fetchPackages}>{t('common.refresh', 'Refresh')}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">{t('organizer.queue.packages', 'Packages')}</h2>
          {loading ? <div>{t('organizer.queue.loading', 'Loading...')}</div> : (
            <Droppable droppableId="packages-droppable" type="packages">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {packages.map((p, index) => (
                    <Draggable draggableId={p.id} index={index} key={p.id}>
                      {(prov) => (
                        <li ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="py-2 border-b flex justify-between items-center">
                            <div onClick={() => openPackage(p)} className="cursor-pointer">
                            <div className="font-semibold">{t('organizer.queue.routeLabel','Route')}: {p.routeId}</div>
                            <div className="text-sm text-gray-500">{new Date(p.departureDate).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="outline-button" onClick={() => handlePackageMove(p, 'up')}>↑</button>
                            <button className="outline-button" onClick={() => handlePackageMove(p, 'down')}>↓</button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          )}
        </div>

        <div className="card p-4 col-span-2">
          <h2 className="font-semibold mb-2">{t('organizer.queue.details', 'Package Details')}</h2>
          {selected ? (
            <div>
              <div className="mb-4">{t('organizer.queue.selectedPackage', 'Selected Package:')} <strong>{selected.id}</strong></div>
              <div className="mb-4 flex gap-2">
                <input placeholder={t('organizer.queue.searchPlaceholder', 'Search trips by id or destination')} value={newTripId} onChange={(e) => setNewTripId(e.target.value)} className="input-field mr-2" />
                <button className="primary-button" onClick={handleAddTrip}>{t('organizer.queue.addTrip', 'Add Trip')}</button>
                <button className="outline-button" onClick={async () => {
                  // simple search using trips endpoint
                  try {
                    const { data } = await getTrips();
                    const q = newTripId.toLowerCase();
                    const results = (data || []).filter(t => (t.id || '').toString().toLowerCase().includes(q) || (t.route?.name || '').toString().toLowerCase().includes(q) || (t.routeId || '').toString().toLowerCase().includes(q));
                    if (results.length) {
                      // set first match as candidate to add
                      setNewTripId(results[0].id);
                    }
                  } catch (e) { console.error(e); }
                }}>{t('organizer.queue.search', 'Search')}</button>
              </div>
              <Droppable droppableId="trips-droppable" type="trips">
                {(provided) => (
                  <table className="w-full" {...provided.droppableProps} ref={provided.innerRef}>
                    <thead><tr><th>{t('organizer.queue.col.pos','Pos')}</th><th>{t('organizer.queue.col.tripId','TripId')}</th><th>{t('organizer.queue.col.actions','Actions')}</th></tr></thead>
                    <tbody>
                      {trips.map((ti, index) => (
                        <Draggable key={ti.tripId} draggableId={ti.tripId} index={index}>
                          {(prov) => (
                            <tr ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="border-t">
                              <td className="py-2">{ti.queuePosition}</td>
                              <td className="py-2">{ti.tripId}</td>
                              <td className="py-2">
                                <div className="flex gap-2">
                                  <button className="outline-button" onClick={() => handleTripMove(ti.tripId, 'up')}>↑</button>
                                  <button className="outline-button" onClick={() => handleTripMove(ti.tripId, 'down')}>↓</button>
                                  <button className="danger-button" onClick={() => handleRemoveTrip(ti.tripId)}>{t('common.remove','Remove')}</button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </div>
          ) : (
            <div>{t('organizer.queue.selectPackage', 'Select a package to view details')}</div>
          )}
        </div>
      </div>
    </div>
    </DragDropContext>
  );
}
