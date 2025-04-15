import React, { useState } from 'react';

const EnhancedBSONDemo = () => {
  const [searchField, setSearchField] = useState('color');
  const [searchStep, setSearchStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSizeStats, setShowSizeStats] = useState(false);

  // More complex document structure with deeper nesting
  const document = {
    _id: 81873,
    color: "Red",
    size: "Small",
    shape: "Cylinder",
    metadata: {
      created: "2023-05-15",
      updated: "2023-11-22",
      tags: ["inventory", "retail", "featured"],
      department: {
        name: "Home Goods",
        floor: 3,
        manager: {
          id: 45892,
          name: "Sarah Johnson",
          contact: {
            email: "sjohnson@example.com",
            phone: "555-1234"
          }
        }
      }
    },
    inventory: {
      quantity: 157,
      location: {
        warehouse: "Central",
        aisle: "B",
        shelf: 12,
        bin: 45
      },
      pricing: {
        regular: 29.99,
        sale: 24.99,
        discount: {
          percent: 15,
          validUntil: "2023-12-31"
        }
      }
    },
    props: { edge: 2, face: 3 },
    coords: [2.2, 5.1]
  };

  // BSON representation with visualization properties and deeper nesting
  const bsonFields = [
    { type: "09 (int32)", name: "_id", length: "", value: "00,01,3F,D3", size: 12 },
    { type: "02 (string)", name: "color", length: "04", value: "Red", size: 10 },
    { type: "02 (string)", name: "size", length: "05", value: "Small", size: 12 },
    { type: "02 (string)", name: "shape", length: "09", value: "Cylinder", size: 16 },
    { type: "03 (document)", name: "metadata", length: "198", value: "{created, updated, tags, department}", nested: true, size: 205, 
      contains: [
        { name: "created", value: "2023-05-15", size: 18 },
        { name: "updated", value: "2023-11-22", size: 18 },
        { name: "tags", value: "[inventory, retail, featured]", size: 35 },
        { name: "department", value: "{name, floor, manager}", nested: true, size: 120,
          contains: [
            { name: "name", value: "Home Goods", size: 18 },
            { name: "floor", value: "3", size: 10 },
            { name: "manager", value: "{id, name, contact}", nested: true, size: 85,
              contains: [
                { name: "id", value: "45892", size: 12 },
                { name: "name", value: "Sarah Johnson", size: 20 },
                { name: "contact", value: "{email, phone}", nested: true, size: 45,
                  contains: [
                    { name: "email", value: "sjohnson@example.com", size: 28 },
                    { name: "phone", value: "555-1234", size: 14 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    { type: "03 (document)", name: "inventory", length: "147", value: "{quantity, location, pricing}", nested: true, size: 155,
      contains: [
        { name: "quantity", value: "157", size: 12 },
        { name: "location", value: "{warehouse, aisle, shelf, bin}", nested: true, size: 55,
          contains: [
            { name: "warehouse", value: "Central", size: 15 },
            { name: "aisle", value: "B", size: 8 },
            { name: "shelf", value: "12", size: 10 },
            { name: "bin", value: "45", size: 10 }
          ]
        },
        { name: "pricing", value: "{regular, sale, discount}", nested: true, size: 80,
          contains: [
            { name: "regular", value: "29.99", size: 14 },
            { name: "sale", value: "24.99", size: 12 },
            { name: "discount", value: "{percent, validUntil}", nested: true, size: 45,
              contains: [
                { name: "percent", value: "15", size: 12 },
                { name: "validUntil", value: "2023-12-31", size: 25 }
              ]
            }
          ]
        }
      ]
    },
    { type: "03 (document)", name: "props", length: "14", value: "{edge: 2, face: 3}", nested: true, size: 20 },
    { type: "04 (array)", name: "coords", length: "16", value: "[2.2, 5.1]", nested: true, size: 22 }
  ];

  // Predefined search paths with more options showing nested values
  const searchPaths = {
    'color': [0, 1],
    'shape': [0, 1, 2, 3],
    'metadata.department.manager.name': [0, 1, 2, 3, 4], // Will expand to show nested doc traversal
    'inventory.pricing.discount.percent': [0, 1, 2, 3, 4, 5], // Will expand to show nested doc traversal
    'props.face': [0, 1, 2, 3, 4, 5, 6],
    'coords.1': [0, 1, 2, 3, 4, 5, 6, 7]
  };

  // Calculate bytes "examined" and bytes "skipped" for the current search
  const getByteStats = () => {
    const targetField = searchField;
    let bytesExamined = 0;
    let bytesSkipped = 0;
    let totalBytes = bsonFields.reduce((sum, field) => sum + field.size, 0);
    
    // Calculate based on current step
    for (let i = 0; i < bsonFields.length; i++) {
      const field = bsonFields[i];
      
      if (i < Math.floor(searchStep)) {
        // We've already examined this field
        bytesExamined += field.size;
      } else if (i === Math.floor(searchStep)) {
        // We're currently examining this field
        bytesExamined += field.size;
      } else if (i > Math.floor(searchStep)) {
        // We haven't reached this field yet
        if (searchField.startsWith(field.name)) {
          // We'll need to look in this nested document later
          // (just count it as not yet examined for now)
        } else {
          // We'll skip this field entirely due to not matching
          bytesSkipped += field.size;
        }
      }
    }
    
    // Adjust for nested document skipping
    if (searchField.includes('.')) {
      const parentField = searchField.split('.')[0];
      const relevantFields = bsonFields.filter(field => 
        field.name !== parentField && !searchField.startsWith(field.name));
      
      // If we've already found our parent field, all other fields can be skipped
      if (Math.floor(searchStep) > bsonFields.findIndex(f => f.name === parentField)) {
        bytesSkipped = relevantFields.reduce((sum, field) => sum + field.size, 0);
      }
    }
    
    return {
      examined: bytesExamined,
      skipped: bytesSkipped,
      total: totalBytes,
      percentSkipped: Math.round((bytesSkipped / totalBytes) * 100)
    };
  };

  // Get appropriate message for the current search step
  const getStepMessage = () => {
    if (searchStep === 0) {
      return "Starting at beginning of document...";
    }
    
    const stepIndex = Math.floor(searchStep);
    if (stepIndex >= bsonFields.length) {
      return "Reached end of document. Field not found.";
    }
    
    const field = bsonFields[stepIndex];
    const targetParts = searchField.split('.');
    
    if (field.name === targetParts[0]) {
      // Found the top-level field we're looking for
      if (targetParts.length === 1) {
        return `Found "${field.name}" field! Returning value: "${field.value}"`;
      } else {
        // Need to look deeper
        return `Found "${field.name}" field. It's a nested document of length ${field.length} bytes. Looking inside for ${targetParts.slice(1).join('.')}...`;
      }
    } else if (field.nested && searchStep > stepIndex && !searchField.startsWith(field.name)) {
      // We're going to skip a nested document
      return `Skipping entire "${field.name}" object (${field.length} bytes) using length information!`;
    } else {
      // Just examining a field that's not what we're looking for
      return `Checking "${field.name}" field - not our target "${targetParts[0]}". Moving on...`;
    }
  };

  // Start a search for a specific field
  const startFieldSearch = (field) => {
    setSearchField(field);
    setSearchStep(0);
    setIsAnimating(false);
    setShowSizeStats(true);
  };
  
  // Advance to the next step in the search
  const nextStep = () => {
    if (searchStep >= Math.max(...searchPaths[searchField])) {
      // Reset when we reach the end
      setSearchStep(0);
    } else {
      // Find the next step in the search path
      const currentIndex = searchPaths[searchField].indexOf(searchStep);
      if (currentIndex >= 0 && currentIndex < searchPaths[searchField].length - 1) {
        setSearchStep(searchPaths[searchField][currentIndex + 1]);
      } else {
        // Just increment if not found in the path
        setSearchStep(searchStep + 1);
      }
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-50 p-4">
      <div className="bg-blue-50 p-3 mb-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">MongoDB BSON Document Structure</h1>
        <p>BSON stores each field with its <strong>type</strong>, <strong>name</strong>, <strong>length</strong>, and <strong>value</strong>.</p>
        <p>When MongoDB looks for fields, it starts at the beginning and traverses sequentially.</p>
        <p>The <strong>length</strong> field allows MongoDB to <strong>skip entire nested structures</strong> when not needed!</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/5">
          <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mb-4 max-h-96 overflow-auto">
            <div className="mb-1 text-gray-400">// MongoDB JSON Document</div>
            <pre className="text-xs">
{`{
  _id: ${document._id},
  color: "${document.color}",
  size: "${document.size}",
  shape: "${document.shape}",
  metadata: {
    created: "${document.metadata.created}",
    updated: "${document.metadata.updated}",
    tags: ${JSON.stringify(document.metadata.tags)},
    department: {
      name: "${document.metadata.department.name}",
      floor: ${document.metadata.department.floor},
      manager: {
        id: ${document.metadata.department.manager.id},
        name: "${document.metadata.department.manager.name}",
        contact: {
          email: "${document.metadata.department.manager.contact.email}",
          phone: "${document.metadata.department.manager.contact.phone}"
        }
      }
    }
  },
  inventory: {
    quantity: ${document.inventory.quantity},
    location: {
      warehouse: "${document.inventory.location.warehouse}",
      aisle: "${document.inventory.location.aisle}",
      shelf: ${document.inventory.location.shelf},
      bin: ${document.inventory.location.bin}
    },
    pricing: {
      regular: ${document.inventory.pricing.regular},
      sale: ${document.inventory.pricing.sale},
      discount: {
        percent: ${document.inventory.pricing.discount.percent},
        validUntil: "${document.inventory.pricing.discount.validUntil}"
      }
    }
  },
  props: { edge: ${document.props.edge}, face: ${document.props.face} },
  coords: [${document.coords.join(', ')}]
}`}
            </pre>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h2 className="text-lg font-semibold mb-2">Select a Field to Search</h2>
            <p className="text-sm mb-3">Watch how MongoDB traverses the BSON structure</p>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button 
                onClick={() => startFieldSearch('color')} 
                className={`px-3 py-2 text-sm rounded ${searchField === 'color' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} hover:bg-blue-200`}
              >
                color
              </button>
              <button 
                onClick={() => startFieldSearch('shape')} 
                className={`px-3 py-2 text-sm rounded ${searchField === 'shape' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} hover:bg-blue-200`}
              >
                shape
              </button>
              <button 
                onClick={() => startFieldSearch('metadata.department.manager.name')} 
                className={`px-3 py-2 text-sm rounded ${searchField === 'metadata.department.manager.name' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} hover:bg-blue-200`}
              >
                metadata.department.manager.name
              </button>
              <button 
                onClick={() => startFieldSearch('inventory.pricing.discount.percent')} 
                className={`px-3 py-2 text-sm rounded ${searchField === 'inventory.pricing.discount.percent' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} hover:bg-blue-200`}
              >
                inventory.pricing.discount.percent
              </button>
              <button 
                onClick={() => startFieldSearch('props.face')} 
                className={`px-3 py-2 text-sm rounded ${searchField === 'props.face' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} hover:bg-blue-200`}
              >
                props.face
              </button>
              <button 
                onClick={() => startFieldSearch('coords.1')} 
                className={`px-3 py-2 text-sm rounded ${searchField === 'coords.1' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'} hover:bg-blue-200`}
              >
                coords[1]
              </button>
            </div>
            
            {/* Manual step navigation */}
            <div className="flex justify-center mt-4">
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700"
              >
                Next Step →
              </button>
            </div>
          </div>
          
          {showSizeStats && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold mb-1">Performance Analysis:</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span>Bytes examined:</span>
                  <span className="font-mono">{getByteStats().examined} bytes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bytes skipped:</span>
                  <span className="font-mono text-green-600 font-bold">{getByteStats().skipped} bytes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total document size:</span>
                  <span className="font-mono">{getByteStats().total} bytes</span>
                </div>
                <div className="mt-2 bg-gray-200 h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${getByteStats().percentSkipped}%` }}
                  ></div>
                </div>
                <div className="text-center text-xs">
                  {getByteStats().percentSkipped}% of document skipped!
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-3/5">
          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">Searching for: <span className="text-blue-600">{searchField}</span></div>
              <div className="text-sm text-gray-500">{searchStep > 0 ? `Step ${Math.round(searchStep)}` : 'Ready'}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded text-sm min-h-8">
              {getStepMessage()}
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-800 text-white text-sm">
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-left bg-yellow-600">Length</th>
                  <th className="py-2 px-3 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {bsonFields.map((field, index) => {
                  const isActive = index === Math.floor(searchStep);
                  const isHighlighted = index === Math.floor(searchStep) || 
                    (searchField.includes('.') && 
                     field.name === searchField.split('.')[0] && 
                     index < searchStep);
                  
                  // Calculate if this field will be skipped
                  const willBeSkipped = field.nested && 
                                       searchStep > index && 
                                       !searchField.startsWith(field.name);
                  
                  return (
                    <tr key={index} className={`border-b border-gray-100 text-sm
                      ${isActive ? 'bg-blue-100' : isHighlighted ? 'bg-blue-50' : ''}
                      ${willBeSkipped ? 'line-through opacity-50' : ''}`}
                    >
                      <td className="py-2 px-3">{field.type}</td>
                      <td className="py-2 px-3 font-medium">
                        {field.name}
                        {field.name === searchField.split('.')[0] && searchField.includes('.') && isHighlighted && (
                          <span className="ml-1 text-xs bg-blue-700 text-white px-1 rounded">looking inside</span>
                        )}
                      </td>
                      <td className={`py-2 px-3 ${field.nested ? 'bg-yellow-100 font-bold' : ''}`}>{field.length}</td>
                      <td className="py-2 px-3 max-w-xs truncate">
                        {field.value}
                        {willBeSkipped && (
                          <span className="ml-1 text-xs bg-green-700 text-white px-1 rounded">skipped!</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Why This Matters</h3>
            <div className="text-sm space-y-2">
              <p><strong>In traditional databases</strong>, deeply nested data often causes performance problems.</p>
              <p><strong>In MongoDB</strong>, the opposite is true - nested documents can improve performance!</p>
              <p>This is because:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>The <strong>length</strong> field in BSON lets MongoDB <strong>skip entire nested structures</strong></li>
                <li>When searching for fields, MongoDB can jump past large nested documents not relevant to the query</li>
                <li>The more complex and deeply nested your documents, the <strong>more bytes can be skipped</strong></li>
                <li>This makes operations on specific fields in large documents extremely efficient</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBSONDemo;