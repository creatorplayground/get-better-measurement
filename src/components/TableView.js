import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/20/solid';

const headerLabels = {
  company_name: 'Company',
  employee_count: 'Employee Count',
  year_founded: 'Founded',
  website_url: 'Website',
  product_category: 'Category',
  proprietary_measurement: 'Proprietary Measurement',
  has_ai: 'Includes AI',
  feature_criteria_discover: 'Discover', // #61c1b6
  feature_criteria_target: 'Target', // #61c1b6
  feature_criteria_publish: 'Publish', // #d4373e
  feature_criteria_manage: 'Manage', // #d4373e
  feature_criteria_measure: 'Measure', // #f2a341
  feature_criteria_report: 'Report', // #f2a341
  feature_criteria_optimize: 'Optimize', // #f2a341
  data_criteria_owned: 'Owned', // #909090
  data_criteria_rented: 'Rented', // #909090
  insight_criteria_predictive: 'Predictive', // #909090
  insight_criteria_reporting: 'Reporting', // #909090
};

function TableView() {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [ascending, setAscending] = useState(true);
  const [activeCriteria, setActiveCriteria] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedRows, setSelectedRows] = useState({});
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const scrollRef = React.useRef(null);

  // Extracted fetch-and-parse logic as loadData
  const loadData = () => {
    fetch('/data_2025-07-10.csv')
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            const cleanedData = results.data.filter((row) => Object.values(row).some((val) => val != null && String(val).trim() !== ''));
            setData(cleanedData);
          },
        });
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMouseDown = (e) => {
    const slider = scrollRef.current;
    setIsDragging(true);
    setStartX(e.pageX - slider.offsetLeft);
    setScrollLeft(slider.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const slider = scrollRef.current;
    const x = e.pageX - slider.offsetLeft;
    const walk = x - startX;
    slider.scrollLeft = scrollLeft - walk;
  };

  const filteredData = data.filter((row) => {
    return ['company_name', 'product_category', 'proprietary_measurement'].some((key) => {
      const val = row[key];
      return String(val ?? '')
        .toLowerCase()
        .includes(filterText.toLowerCase());
    });
  });

  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const valA = a[sortKey] ?? '';
        const valB = b[sortKey] ?? '';
        return ascending
          ? String(valA).localeCompare(String(valB), undefined, {
              numeric: true,
            })
          : String(valB).localeCompare(String(valA), undefined, {
              numeric: true,
            });
      })
    : filteredData;

  return (
    <div className="min-h-screen bg-[#f4f2f1] px-4 pb-16">
      <div className="page-container mx-auto">
        <div className="page-header py-8 flex-row flex items-center justify-between">
          <div>
            <a href="https://www.getbettermeasurement.com/" className="text-[#03039d] underline hover:no-underline">
              Return to website
            </a>
          </div>
          <div>
            <button onClick={() => setShowHelpDialog(true)} className="text-[#03039d] underline hover:no-underline">
              How to use this tool
            </button>
          </div>
        </div>
        <div className="page-content">
          <div className="mb-4 sm:hidden">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`w-full rounded-md px-4 py-3 text-sm text-white ${
                showFilters ? 'bg-[#03039d] hover:opacity-60' : 'bg-[#03039d] hover:opacity-60'
              }`}
            >
              {showFilters ? 'Close' : 'Search'}
            </button>
          </div>
          {(showFilters || typeof window === 'undefined' /* SSR fallback */ || window.innerWidth >= 640) && (
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => {
                  const selectedKeys = Object.keys(selectedRows).filter((key) => selectedRows[key]);
                  if (selectedKeys.length === 0) {
                    alert('Please select at least one product to compare.');
                    return;
                  }
                  const filtered = data.filter((row) => selectedRows[row.company_name]);
                  setData(filtered);
                }}
                className="w-full sm:w-auto rounded-md bg-[#03039d] px-4 py-3 text-sm text-white hover:bg-opacity-70 whitespace-nowrap"
              >
                Compare
              </button>
              <input
                id="filter"
                name="filter"
                type="text"
                placeholder="Search by Company, Category, or Measurement"
                aria-label="Filter"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:w-1/2"
              />
              <div className="w-full sm:w-1/4">
                <Listbox value={sortKey} onChange={(value) => setSortKey(value || null)}>
                  <div className="relative">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-3 pl-4 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm">
                      <span className="col-start-1 row-start-1 truncate pr-6">{sortKey ? headerLabels[sortKey] || sortKey : 'Sort'}</span>
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
                    >
                      <ListboxOption value="" className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900">
                        <span className="block truncate font-normal">Sort by...</span>
                      </ListboxOption>
                      {data.length > 0 &&
                        Object.keys(data[0])
                          .filter((key) => key !== 'website_url')
                          .map((key) => (
                            <ListboxOption
                              key={key}
                              value={key}
                              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                            >
                              <span className="block truncate font-normal group-data-[selected]:font-semibold">
                                {headerLabels[key] || key}
                              </span>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                <CheckIcon aria-hidden="true" className="size-5" />
                              </span>
                            </ListboxOption>
                          ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
              {(() => {
                const sortOrders = [
                  { id: 'asc', label: 'Ascending' },
                  { id: 'desc', label: 'Descending' },
                ];
                const currentOrder = ascending ? sortOrders[0] : sortOrders[1];
                return (
                  <div className="w-full sm:w-1/4">
                    <Listbox value={currentOrder} onChange={(value) => setAscending(value.id === 'asc')}>
                      <div className="relative">
                        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-3 pl-4 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm">
                          <span className="col-start-1 row-start-1 truncate pr-6">{currentOrder.label}</span>
                          <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                          />
                        </ListboxButton>
                        <ListboxOptions
                          transition
                          className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
                        >
                          {sortOrders.map((option) => (
                            <ListboxOption
                              key={option.id}
                              value={option}
                              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                            >
                              <span className="block truncate font-normal group-data-[selected]:font-semibold">{option.label}</span>
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                                <CheckIcon aria-hidden="true" className="size-5" />
                              </span>
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                );
              })()}
              <button
                onClick={() => {
                  setFilterText('');
                  setSortKey(null);
                  setAscending(true);
                  setSelectedRows({});
                  loadData();
                }}
                className="w-full sm:w-auto rounded-md bg-white px-4 py-3 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          )}
          <div className="border border-[#03039d] rounded-md">
            <div
              ref={scrollRef}
              className="overflow-x-auto border-4 border-white scrollbar-hide scrollbar-hidden rounded-md bg-white cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <table className="table-fixed min-w-full divide-y divide-gray-200 text-left text-gray-700">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-4 text-sm text-[#03039d] font-medium">Compare</th>
                    {data.length > 0 &&
                      Object.keys(data[0])
                        .filter((key) => key !== 'website_url')
                        .map((key) => (
                          <th
                            key={key}
                            className={`whitespace-nowrap py-4 font-medium text-sm text-[#03039d] ${key === 'company_name' ? '' : ''} ${
                              key === 'company_name'
                                ? 'px-4 w-[200px] min-w-[200px] max-w-[200px]'
                                : key === 'employee_count' || key === 'year_founded' || key === 'has_ai'
                                  ? 'px-4 w-[120px] min-w-[140px] max-w-[120px]'
                                  : key.includes('_criteria_')
                                    ? 'px-2 w-[120px] min-w-[120px]'
                                    : 'px-4'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span>{headerLabels[key] || key}</span>
                              {[
                                'feature_criteria_discover',
                                'feature_criteria_target',
                                'feature_criteria_publish',
                                'feature_criteria_manage',
                                'feature_criteria_measure',
                                'feature_criteria_report',
                                'feature_criteria_optimize',
                                'data_criteria_owned',
                                'data_criteria_rented',
                                'insight_criteria_predictive',
                                'insight_criteria_reporting',
                              ].includes(key) && (
                                <button onClick={() => setActiveCriteria(key)} className="text-gray-300 hover:text-gray-600">
                                  <InformationCircleIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 border-b border-white">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={!!selectedRows[row.company_name]}
                          onChange={(e) => {
                            const updated = { ...selectedRows };
                            if (e.target.checked) {
                              updated[row.company_name] = true;
                            } else {
                              delete updated[row.company_name];
                            }
                            setSelectedRows(updated);
                          }}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </td>
                      {Object.entries(row)
                        .filter(([key]) => key !== 'website_url')
                        .map(([key, val], i) => {
                          const content =
                            key === 'company_name' && row.website_url ? (
                              <a
                                href={row.website_url.startsWith('http') ? row.website_url : `https://${row.website_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full px-4 py-4 text-left hover:bg-[#03039d] hover:bg-opacity-10 font-medium text-gray-950"
                              >
                                {val}
                              </a>
                            ) : val == null ? (
                              ''
                            ) : (
                              String(val)
                            );
                          return (
                            <td
                              key={i}
                              className={`relative whitespace-nowrap ${
                                key === 'company_name' ? 'bg-gray-50 border-r border-gray-200' : 'px-4 py-4'
                              } ${key.includes('_criteria_') ? '' : 'text-gray-700'}`}
                            >
                              {key.includes('_criteria_') && (val === 'Yes' || val === 'No') ? (
                                <div
                                  className={`absolute inset-0 border-2 border-white rounded-md p-0 ${
                                    val === 'Yes'
                                      ? key === 'feature_criteria_discover' || key === 'feature_criteria_target'
                                        ? 'bg-[#61c1b6]'
                                        : key === 'feature_criteria_publish' || key === 'feature_criteria_manage'
                                          ? 'bg-[#d4373e]'
                                          : key === 'feature_criteria_measure' ||
                                              key === 'feature_criteria_report' ||
                                              key === 'feature_criteria_optimize'
                                            ? 'bg-[#f2a341]'
                                            : key === 'data_criteria_owned' || key === 'data_criteria_rented'
                                              ? 'bg-[#909090]'
                                              : key === 'insight_criteria_predictive' || key === 'insight_criteria_reporting'
                                                ? 'bg-[#909090]'
                                                : ''
                                      : ''
                                  }`}
                                />
                              ) : key === 'has_ai' && String(val).toLowerCase() === 'no' ? (
                                <span className="opacity-50">{content}</span>
                              ) : (
                                content
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="page-footer mt-10 mx-auto text-left text-gray-500 text-sm space-y-2">
          <p>
            Presented by{' '}
            <a href="https://www.eastwindadvisors.com/" target="_blank" rel="noreferrer" className="text-gray-900 hover:underline">
              East Wind Advisors
            </a>
            ,{' '}
            <a href="https://www.creatorvision.co/" target="_blank" rel="noreferrer" className="text-gray-900 hover:underline">
              Creator Vision
            </a>{' '}
            +{' '}
            <a href="https://www.creatorplayground.io/" target="_blank" rel="noreferrer" className="text-gray-900 hover:underline">
              Creator Playground
            </a>
          </p>
          <p>
            Disclaimer: The information set forth herein has been obtained or derived from sources believed by East Wind Advisors (“East
            Wind”) to be reliable. East Wind does not make any representation or warranty, express or implied, as to the information's
            accuracy or completeness, nor does East Wind recommend that the information serve as the basis of any investment decision. Any
            reliance on the information provided herein is solely at the user's own risk. Opinions and any other contents at this site are
            subject to change without notice.
          </p>
          <p>Securities transactions conducted through East Wind Securities, LLC, a FINRA registered broker-dealer and member SIPC.</p>
        </div>
      </div>

      {activeCriteria && (
        <div className="page-dialogs fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">{headerLabels[activeCriteria]}</h2>
            <p className="text-gray-700 mb-4">
              {(() => {
                switch (activeCriteria) {
                  case 'feature_criteria_discover':
                    return 'Search internal or external talent databases to find the most relevant creators for a campaign.';
                  case 'feature_criteria_target':
                    return 'Identify and define audience segments based on research and data.';
                  case 'feature_criteria_publish':
                    return 'Post content directly to social networks or video platforms from the product.';
                  case 'feature_criteria_manage':
                    return 'Organize and oversee project or campaign details, tasks, and communications.';
                  case 'feature_criteria_measure':
                    return 'Collect and aggregate data from internal or external sources for analysis.';
                  case 'feature_criteria_report':
                    return 'Generate reports or visual summaries that highlight key metrics and insights.';
                  case 'feature_criteria_optimize':
                    return 'Use data-driven insights to refine content and improve performance.';
                  case 'data_criteria_owned':
                    return 'Uses owned data like first-party customer or user information.';
                  case 'data_criteria_rented':
                    return 'Uses rented or third-party data sources to inform decision-making.';
                  case 'insight_criteria_predictive':
                    return 'Delivers predictive insights using modeling or forward-looking analysis.';
                  case 'insight_criteria_reporting':
                    return 'Delivers reporting insights based on historical data aggregation.';
                  default:
                    return '';
                }
              })()}
            </p>
            <button
              onClick={() => setActiveCriteria(null)}
              className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showHelpDialog && (
        <div className="page-dialogs fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md">
            <h2 className="text-lg font-semibold mb-6 text-gray-900">How to use this tool</h2>
            <div className="mb-8">
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>
                  Use the <span className="font-semibold">Search Bar</span> to filter companies by name, category, or measurement.
                </li>
                <li>Sort by any column to organize the table.</li>
                <li>
                  Select products using the checkboxes, then click <span className="font-semibold">Compare</span> to focus your view.
                </li>
                <li>Click the info icons in headers to see what each feature means.</li>
                <li>
                  <span className="font-semibold">Tip:</span> Drag horizontally to scroll and view all columns.
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelpDialog(false)}
              className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableView;
