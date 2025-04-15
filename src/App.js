import React, { useState } from 'react';
import { Modal, IconButton, Button, Tooltip, Paper } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';

// MongoDB Brand Colors
const mongoColors = {
  // Primary colors
  green: "#00ED64", // Bright green for CTAs and highlights
  darkGreen: "#001E2B", // Dark navy/teal for backgrounds
  white: "#FFFFFF",
  
  // Secondary colors
  mint: "#C3F4D7", // Light mint for subtle highlights
  lightGreen: "#E3FCF7", // Very light mint for hover states
  blueGreen: "#00684A", // Darker green for secondary elements
  
  // Text colors
  textDark: "#001E2B",
  textLight: "#FFFFFF",
  textMedium: "#889397" // Medium gray for secondary text
};

const MongoDBBSONDemo = () => {
  const [searchField, setSearchField] = useState('color');
  const [searchStep, setSearchStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSizeStats, setShowSizeStats] = useState(false);
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const [walkthrough, setWalkthrough] = useState({
    active: false,
    step: 0
  });

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

  // Walkthrough steps configuration
  const walkthroughSteps = [
    {
      target: 'json-document',
      title: 'MongoDB Document',
      content: 'This is a sample MongoDB document. Notice how it contains nested fields and different data types.',
      placement: 'right'
    },
    {
      target: 'search-buttons',
      title: 'Field Selection',
      content: 'Click any of these buttons to search for a specific field. Try both simple fields like "color" and nested fields like "metadata.department.manager.name".',
      placement: 'right'
    },
    {
      target: 'next-step-button',
      title: 'Step Through Search',
      content: 'Click this button to see how MongoDB traverses the document structure, examining or skipping fields based on the length information.',
      placement: 'top'
    },
    {
      target: 'performance-analysis',
      title: 'Performance Analysis',
      content: 'Watch how MongoDB can skip entire nested documents when they are not relevant to your search, making queries more efficient.',
      placement: 'left'
    },
    {
      target: 'bson-table',
      title: 'BSON Structure',
      content: 'This table shows how MongoDB stores your document in BSON format, with type, name, length, and value information for each field.',
      placement: 'left'
    }
  ];

  // Function to start walkthrough
  const startWalkthrough = () => {
    setWalkthrough({
      active: true,
      step: 0
    });
    // Reset demo state
    setSearchField('color');
    setSearchStep(0);
    setShowSizeStats(true);
  };

  // Function to handle walkthrough navigation
  const handleWalkthroughStep = (direction) => {
    if (direction === 'next' && walkthrough.step < walkthroughSteps.length - 1) {
      setWalkthrough({
        ...walkthrough,
        step: walkthrough.step + 1
      });
    } else if (direction === 'prev' && walkthrough.step > 0) {
      setWalkthrough({
        ...walkthrough,
        step: walkthrough.step - 1
      });
    } else if (direction === 'next') {
      // End walkthrough
      setWalkthrough({
        active: false,
        step: 0
      });
    }
  };

  // Walkthrough tooltip content
  const WalkthroughTooltip = ({ step }) => (
    <Paper sx={{ 
      p: 2, 
      maxWidth: 300,
      backgroundColor: mongoColors.white,
      border: `1px solid ${mongoColors.lightGreen}`
    }}>
      <h3 style={{ color: mongoColors.darkGreen, marginBottom: '0.5rem', fontWeight: 600 }}>
        {walkthroughSteps[step].title}
      </h3>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        {walkthroughSteps[step].content}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          size="small"
          disabled={step === 0}
          onClick={() => handleWalkthroughStep('prev')}
          style={{ 
            color: step === 0 ? mongoColors.textMedium : mongoColors.blueGreen
          }}
        >
          Previous
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleWalkthroughStep('next')}
          style={{ 
            backgroundColor: mongoColors.green,
            color: mongoColors.darkGreen
          }}
        >
          {step === walkthroughSteps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </Paper>
  );

  // Calculate bytes "examined" and bytes "skipped" for the current search
  const getByteStats = () => {
    const targetField = searchField.split('.')[0]; // Get the top-level field we're looking for
    let bytesExamined = 0;
    let bytesSkipped = 0;
    let totalBytes = bsonFields.reduce((sum, field) => sum + field.size, 0);
    
    // Calculate based on current step
    for (let i = 0; i < bsonFields.length; i++) {
      const field = bsonFields[i];
      
      if (i < Math.floor(searchStep)) {
        // We've already examined this field
        if (field.nested && field.name !== targetField) {
          // If it's a nested document and not our target, we skipped it
          bytesSkipped += field.size;
        } else {
          // Otherwise we examined it
          bytesExamined += field.size;
        }
      } else if (i === Math.floor(searchStep)) {
        // We're currently examining this field
        bytesExamined += field.size;
      } else if (i > Math.floor(searchStep)) {
        // We haven't reached this field yet
        if (field.name === targetField) {
          // This is our target field, we'll examine it later
          continue;
        } else {
          // We'll skip this field entirely
          bytesSkipped += field.size;
        }
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
    <div className="flex flex-col w-full" style={{ backgroundColor: mongoColors.darkGreen, color: mongoColors.textLight }}>
      <div style={{ 
        backgroundColor: mongoColors.darkGreen, 
        padding: '1.5rem', 
        marginBottom: '1rem', 
        borderBottom: `1px solid ${mongoColors.blueGreen}`,
        color: mongoColors.textLight
      }}>
        <div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: mongoColors.textLight }}>MongoDB BSON Document Structure</h1>
          <p className="mb-2">BSON stores each field with its <strong>type</strong>, <strong>name</strong>, <strong>length</strong>, and <strong>value</strong>.</p>
          <p className="mb-2">When MongoDB looks for fields, it starts at the beginning and traverses sequentially.</p>
          <p>The <strong>length</strong> field allows MongoDB to <strong>skip entire nested structures</strong> when not needed!</p>
        </div>
        <Button
          variant="contained"
          startIcon={<SchoolIcon />}
          onClick={startWalkthrough}
          style={{ 
            backgroundColor: mongoColors.green,
            color: mongoColors.darkGreen,
            marginTop: '1rem',
            fontWeight: 600
          }}
        >
          Start Tutorial
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 px-4">
        <div className="w-full md:w-2/5">
          <Tooltip
            open={walkthrough.active && walkthrough.step === 0}
            placement={walkthroughSteps[0].placement}
            arrow
            PopperProps={{
              disablePortal: true,
              sx: {
                "& .MuiTooltip-tooltip": {
                  backgroundColor: "transparent",
                  padding: 0
                },
                "& .MuiTooltip-arrow": {
                  color: mongoColors.white
                }
              }
            }}
            title={<WalkthroughTooltip step={0} />}
          >
            <div id="json-document" style={{ 
              backgroundColor: mongoColors.darkGreen, 
              border: `1px solid ${mongoColors.blueGreen}`,
              color: mongoColors.green, 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1rem', 
              maxHeight: '24rem', 
              overflow: 'auto' 
            }}>
              <div className="mb-2" style={{ color: mongoColors.textMedium }}>// MongoDB JSON Document</div>
              <pre className="text-xs" style={{ color: mongoColors.mint }}>
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
          </Tooltip>
          
          <Tooltip
            open={walkthrough.active && walkthrough.step === 1}
            placement={walkthroughSteps[1].placement}
            arrow
            PopperProps={{
              disablePortal: true,
              sx: {
                "& .MuiTooltip-tooltip": {
                  backgroundColor: "transparent",
                  padding: 0
                },
                "& .MuiTooltip-arrow": {
                  color: mongoColors.white
                }
              }
            }}
            title={<WalkthroughTooltip step={1} />}
          >
            <div id="search-buttons" style={{ 
              backgroundColor: mongoColors.white, 
              padding: '1.5rem', 
              borderRadius: '0.375rem', 
              marginBottom: '1rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: mongoColors.darkGreen }}>Select a Field to Search</h2>
              <p className="text-sm mb-4" style={{ color: mongoColors.textMedium }}>Watch how MongoDB traverses the BSON structure</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.keys(searchPaths).map(field => (
                  <button 
                    key={field}
                    onClick={() => startFieldSearch(field)} 
                    style={{ 
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      borderRadius: '0.25rem',
                      backgroundColor: searchField === field ? mongoColors.green : mongoColors.mint,
                      color: searchField === field ? mongoColors.darkGreen : mongoColors.blueGreen,
                      fontWeight: 500,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {field}
                  </button>
                ))}
              </div>

              <Tooltip
                open={walkthrough.active && walkthrough.step === 2}
                placement={walkthroughSteps[2].placement}
                arrow
                PopperProps={{
                  disablePortal: true,
                  sx: {
                    "& .MuiTooltip-tooltip": {
                      backgroundColor: "transparent",
                      padding: 0
                    },
                    "& .MuiTooltip-arrow": {
                      color: mongoColors.white
                    }
                  }
                }}
                title={<WalkthroughTooltip step={2} />}
              >
                <div id="next-step-button" className="flex justify-center">
                  <button
                    onClick={nextStep}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      backgroundColor: mongoColors.green,
                      color: mongoColors.darkGreen,
                      fontWeight: 600,
                      borderRadius: '0.25rem',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Next Step →
                  </button>
                </div>
              </Tooltip>
            </div>
          </Tooltip>
        </div>
        
        <div className="w-full md:w-3/5">
          <div style={{ 
            backgroundColor: mongoColors.white, 
            border: `1px solid ${mongoColors.mint}`,
            borderRadius: '0.375rem', 
            padding: '1rem', 
            marginBottom: '1rem' 
          }}>
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold" style={{ color: mongoColors.darkGreen }}>
                Searching for: <span style={{ color: mongoColors.blueGreen }}>{searchField}</span>
              </div>
              <div className="text-sm" style={{ color: mongoColors.textMedium }}>
                {searchStep > 0 ? `Step ${Math.round(searchStep)}` : 'Ready'}
              </div>
            </div>
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: mongoColors.mint, 
              borderRadius: '0.25rem', 
              fontSize: '0.875rem',
              color: mongoColors.darkGreen,
              minHeight: '2.5rem' 
            }}>
              {getStepMessage()}
            </div>
          </div>

          {showSizeStats && (
            <Tooltip
              open={walkthrough.active && walkthrough.step === 3}
              placement={walkthroughSteps[3].placement}
              arrow
              PopperProps={{
                disablePortal: true,
                sx: {
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: "transparent",
                    padding: 0
                  },
                  "& .MuiTooltip-arrow": {
                    color: mongoColors.white
                  }
                }
              }}
              title={<WalkthroughTooltip step={3} />}
            >
              <div id="performance-analysis" style={{ 
                backgroundColor: mongoColors.white,
                border: `1px solid ${mongoColors.mint}`,
                padding: '1.5rem', 
                borderRadius: '0.375rem', 
                marginBottom: '1rem' 
              }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold" style={{ color: mongoColors.darkGreen }}>Performance Analysis</h3>
                  <IconButton
                    size="small"
                    onClick={() => setOpenHelpModal(true)}
                    style={{ color: mongoColors.blueGreen }}
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </div>
                <div className="text-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span style={{ color: mongoColors.textMedium }}>Bytes examined:</span>
                    <span style={{ fontFamily: 'monospace', color: mongoColors.darkGreen }}>{getByteStats().examined} bytes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: mongoColors.textMedium }}>Bytes skipped:</span>
                    <span style={{ fontFamily: 'monospace', color: mongoColors.green, fontWeight: 'bold' }}>{getByteStats().skipped} bytes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: mongoColors.textMedium }}>Total document size:</span>
                    <span style={{ fontFamily: 'monospace', color: mongoColors.darkGreen }}>{getByteStats().total} bytes</span>
                  </div>
                  <div style={{ 
                    marginTop: '1rem', 
                    backgroundColor: mongoColors.mint, 
                    height: '0.75rem', 
                    borderRadius: '9999px', 
                    overflow: 'hidden' 
                  }}>
                    <div 
                      style={{ 
                        backgroundColor: mongoColors.green, 
                        height: '100%',
                        width: `${getByteStats().percentSkipped}%`,
                        transition: 'width 0.3s ease-in-out'
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-sm font-medium" style={{ color: mongoColors.blueGreen }}>
                    {getByteStats().percentSkipped}% of document skipped!
                  </div>
                </div>
              </div>
            </Tooltip>
          )}
          
          <Tooltip
            open={walkthrough.active && walkthrough.step === 4}
            placement={walkthroughSteps[4].placement}
            arrow
            PopperProps={{
              disablePortal: true,
              sx: {
                "& .MuiTooltip-tooltip": {
                  backgroundColor: "transparent",
                  padding: 0
                },
                "& .MuiTooltip-arrow": {
                  color: mongoColors.white
                }
              }
            }}
            title={<WalkthroughTooltip step={4} />}
          >
            <div id="bson-table" style={{ 
              backgroundColor: mongoColors.white,
              border: `1px solid ${mongoColors.mint}`,
              borderRadius: '0.375rem',
              overflow: 'hidden'
            }}>
              <table className="min-w-full">
                <thead>
                  <tr style={{ backgroundColor: mongoColors.darkGreen, color: mongoColors.textLight, fontSize: '0.875rem' }}>
                    <th className="py-3 px-4 text-left font-semibold">Type</th>
                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                    <th className="py-3 px-4 text-left font-semibold" style={{ backgroundColor: mongoColors.blueGreen }}>Length</th>
                    <th className="py-3 px-4 text-left font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {bsonFields.map((field, index) => {
                    const isActive = index === Math.floor(searchStep);
                    const isHighlighted = index === Math.floor(searchStep) || 
                      (searchField.includes('.') && 
                       field.name === searchField.split('.')[0] && 
                       index < searchStep);
                    
                    const willBeSkipped = field.nested && 
                                         searchStep > index && 
                                         !searchField.startsWith(field.name);
                    
                    return (
                      <tr key={index} style={{ 
                        borderBottom: `1px solid ${mongoColors.mint}`,
                        fontSize: '0.875rem',
                        backgroundColor: isActive ? mongoColors.mint : isHighlighted ? mongoColors.lightGreen : mongoColors.white,
                        textDecoration: willBeSkipped ? 'line-through' : 'none',
                        opacity: willBeSkipped ? 0.5 : 1
                      }}>
                        <td className="py-2 px-4" style={{ color: mongoColors.textDark }}>{field.type}</td>
                        <td className="py-2 px-4 font-medium" style={{ color: mongoColors.blueGreen }}>
                          {field.name}
                          {field.name === searchField.split('.')[0] && searchField.includes('.') && isHighlighted && (
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              fontSize: '0.75rem', 
                              backgroundColor: mongoColors.green, 
                              color: mongoColors.darkGreen, 
                              padding: '0.125rem 0.375rem', 
                              borderRadius: '0.25rem',
                              fontWeight: 600
                            }}>
                              looking inside
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4" style={{ 
                          backgroundColor: field.nested ? mongoColors.mint : 'transparent', 
                          fontWeight: field.nested ? 'bold' : 'normal',
                          color: field.nested ? mongoColors.blueGreen : mongoColors.textDark
                        }}>
                          {field.length}
                        </td>
                        <td className="py-2 px-4 max-w-xs truncate" style={{ color: mongoColors.textDark }}>
                          {field.value}
                          {willBeSkipped && (
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              fontSize: '0.75rem', 
                              backgroundColor: mongoColors.green, 
                              color: mongoColors.darkGreen, 
                              padding: '0.125rem 0.375rem', 
                              borderRadius: '0.25rem',
                              fontWeight: 600
                            }}>
                              skipped!
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Tooltip>
        </div>
      </div>

      <Modal
        open={openHelpModal}
        onClose={() => setOpenHelpModal(false)}
        aria-labelledby="why-this-matters-modal"
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: mongoColors.white,
          padding: '2rem',
          borderRadius: '0.5rem',
          maxWidth: '600px',
          width: '90%',
          outline: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h3 className="font-semibold mb-4" style={{ color: mongoColors.darkGreen }}>Why This Matters</h3>
          <div className="text-sm space-y-3" style={{ color: mongoColors.textDark }}>
            <p><strong>In traditional databases</strong>, deeply nested data often causes performance problems.</p>
            <p><strong>In MongoDB</strong>, the opposite is true - nested documents can improve performance!</p>
            <p>This is because:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>The <strong>length</strong> field in BSON lets MongoDB <strong>skip entire nested structures</strong></li>
              <li>When searching for fields, MongoDB can jump past large nested documents not relevant to the query</li>
              <li>The more complex and deeply nested your documents, the <strong>more bytes can be skipped</strong></li>
              <li>This makes operations on specific fields in large documents extremely efficient</li>
            </ol>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MongoDBBSONDemo;